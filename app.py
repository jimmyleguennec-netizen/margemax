"""
MargeMax — Outil de sourcing et de recherche de produits AliExpress
pour e-commerçants et dropshippers.

Stack : Streamlit + Supabase (DB / Auth) + AliExpress Open Platform (Gateway TOP)
"""

import hashlib
import math
import random
import time
from datetime import datetime, timezone

import requests
import streamlit as st
from supabase import Client, create_client

# ============================================================
# CONFIGURATION GÉNÉRALE
# ============================================================

st.set_page_config(
    page_title="MargeMax — Sourcing AliExpress",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded",
)

def _require_secret(name: str, help_text: str = "") -> str:
    value = st.secrets.get(name, "")
    if not value:
        st.error(
            f"Configuration manquante : `{name}` n'est pas défini dans les secrets Streamlit. "
            + help_text
        )
        st.stop()
    return value


SUPABASE_URL = _require_secret("SUPABASE_URL").strip()
SUPABASE_KEY = _require_secret("SUPABASE_KEY").strip()

with st.expander("🔧 Diagnostic technique (temporaire)", expanded=False):
    st.code(f"SUPABASE_URL = {SUPABASE_URL!r}\nLongueur = {len(SUPABASE_URL)} caractères")
    if st.button("Tester la connexion réseau directe"):
        try:
            test_response = requests.get(SUPABASE_URL, timeout=8)
            st.success(f"Connexion réussie ! Code HTTP : {test_response.status_code}")
        except Exception as test_exc:
            st.error(f"Échec direct avec `requests` : {test_exc!r}")

ALIEXPRESS_APP_KEY = st.secrets.get("ALIEXPRESS_APP_KEY", "")
ALIEXPRESS_APP_SECRET = st.secrets.get("ALIEXPRESS_APP_SECRET", "")
ALIEXPRESS_GATEWAY = "https://eco.taobao.com/router/rest"

ADMIN_EMAIL = "jimmy.leguennec@gmail.com"

FREE_SEARCH_LIMIT = 3
VAT_RATE = 0.20
PAYMENT_FEE_RATE = 0.02
MARGIN_TARGET = 0.45  # prix conseillé = coût réel / 0.45

PLANS = {
    "pass_flash": {
        "label": "Pass Flash",
        "price": "6,99 €",
        "period": "/ semaine",
        "features": ["Recherches illimitées (7 jours)", "1 bannière discrète conservée"],
        "popular": False,
    },
    "pro_monthly": {
        "label": "Pro Mensuel",
        "price": "14,99 €",
        "period": "/ mois",
        "features": [
            "Recherches illimitées",
            "0 publicité",
            "Calculateur de marge",
            "Historique & favoris",
        ],
        "popular": False,
    },
    "pro_yearly": {
        "label": "Pro Annuel",
        "price": "49,99 €",
        "period": "/ an",
        "features": [
            "Recherches illimitées",
            "0 publicité",
            "Export CSV",
            "Générateur de fiche produit",
            "Historique & favoris",
        ],
        "popular": True,
    },
}
# 'free' est le plan par défaut posé par le trigger Supabase — il n'a pas
# besoin d'entrée dans PLANS puisqu'il n'a pas de carte tarifaire dédiée.

# ============================================================
# THÈME "DARK LUXURY" — CSS PERSONNALISÉ
# ============================================================

def inject_custom_css() -> None:
    st.markdown(
        """
        <style>
        :root {
            --bg-primary: #08090C;
            --bg-card: #0F1117;
            --border-subtle: rgba(255, 255, 255, 0.08);
            --accent-indigo: #4F46E5;
            --accent-indigo-hover: #4338CA;
            --text-light: #F5F6FA;
            --text-muted: #8B8FA3;
        }

        .stApp {
            background: var(--bg-primary);
            color: var(--text-light);
        }

        section[data-testid="stSidebar"] {
            background-color: #0B0C10;
            border-right: 1px solid var(--border-subtle);
        }

        .mm-header {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            padding: 20px 0 8px 0;
        }
        .mm-header .mm-logo {
            font-size: 1.6rem;
            font-weight: 700;
            color: var(--text-light);
            letter-spacing: -0.02em;
        }
        .mm-header .mm-bolt {
            font-size: 1.3rem;
            color: var(--accent-indigo);
        }
        .mm-header .mm-ali {
            display: flex;
            align-items: center;
            border: 1px solid var(--border-subtle);
            border-radius: 8px;
            padding: 6px 14px;
            background: var(--bg-card);
        }
        .mm-header .mm-ali img {
            height: 16px;
            filter: brightness(0) invert(1) opacity(0.85);
        }

        .mm-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 12px;
            padding: 22px;
            height: 100%;
        }
        .mm-card h4 {
            margin-top: 0;
            color: var(--text-light);
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .mm-metric-row {
            display: flex;
            justify-content: space-between;
            padding: 7px 0;
            border-bottom: 1px solid var(--border-subtle);
            font-size: 0.92rem;
        }
        .mm-metric-row .label { color: var(--text-muted); }
        .mm-metric-row .value { font-weight: 600; }
        .mm-margin-highlight {
            font-size: 1.5rem;
            font-weight: 700;
            color: #34D399;
            margin-top: 12px;
        }

        .mm-score-badge {
            display: inline-block;
            padding: 6px 14px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 1.05rem;
        }
        .mm-score-high { background: rgba(52, 211, 153, 0.12); color: #34D399; }
        .mm-score-mid  { background: rgba(250, 204, 21, 0.12); color: #FACC15; }
        .mm-score-low  { background: rgba(248, 113, 113, 0.12); color: #F87171; }

        .mm-channel-badge {
            display: inline-block;
            background: rgba(79, 70, 229, 0.12);
            border: 1px solid rgba(79, 70, 229, 0.35);
            color: #A5B4FC;
            border-radius: 6px;
            padding: 3px 10px;
            margin: 3px 4px 0 0;
            font-size: 0.78rem;
        }

        .mm-admin-badge {
            background: var(--accent-indigo);
            color: white;
            font-weight: 700;
            font-size: 0.85rem;
            padding: 8px 12px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 12px;
        }

        .mm-plan-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            position: relative;
            height: 100%;
        }
        .mm-plan-card.popular {
            border: 1px solid var(--accent-indigo);
            box-shadow: 0 0 0 1px rgba(79, 70, 229, 0.25);
        }
        .mm-plan-badge {
            position: absolute;
            top: -13px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--accent-indigo);
            color: white;
            font-weight: 700;
            font-size: 0.68rem;
            padding: 4px 12px;
            border-radius: 999px;
            white-space: nowrap;
        }
        .mm-ad-banner {
            background: var(--bg-card);
            border: 1px dashed var(--border-subtle);
            color: var(--text-muted);
            text-align: center;
            padding: 14px;
            border-radius: 10px;
            font-size: 0.85rem;
            margin-bottom: 14px;
        }

        .mm-trust-row {
            display: flex;
            justify-content: center;
            gap: 18px;
            flex-wrap: wrap;
            margin: 14px 0 6px 0;
        }
        .mm-trust-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.78rem;
            color: var(--text-muted);
        }

        div.stButton > button {
            background: var(--accent-indigo);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0.55rem 1.2rem;
            font-weight: 600;
        }
        div.stButton > button:hover {
            background: var(--accent-indigo-hover);
        }

        .mm-hero {
            text-align: center;
            padding: 40px 10px 20px 10px;
        }
        .mm-hero h1 {
            font-size: 2.4rem;
            font-weight: 700;
            letter-spacing: -0.03em;
            margin-bottom: 12px;
            line-height: 1.2;
        }
        .mm-hero p {
            font-size: 1.05rem;
            color: var(--text-muted);
            max-width: 620px;
            margin: 0 auto 28px auto;
        }
        .mm-hero-cta {
            display: flex;
            justify-content: center;
            gap: 12px;
            flex-wrap: wrap;
        }

        .mm-feature-card {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 12px;
            padding: 26px 22px;
            height: 100%;
        }
        .mm-feature-card .mm-feature-icon {
            font-size: 1.6rem;
            margin-bottom: 10px;
        }
        .mm-feature-card h4 {
            margin: 0 0 8px 0;
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-light);
            text-transform: none;
            letter-spacing: 0;
        }
        .mm-feature-card p {
            color: var(--text-muted);
            font-size: 0.88rem;
            margin: 0;
        }

        .mm-section-title {
            text-align: center;
            font-size: 1.4rem;
            font-weight: 700;
            margin: 44px 0 6px 0;
        }
        .mm-section-subtitle {
            text-align: center;
            color: var(--text-muted);
            font-size: 0.92rem;
            margin-bottom: 26px;
        }

        .mm-mini-plan {
            background: var(--bg-card);
            border: 1px solid var(--border-subtle);
            border-radius: 12px;
            padding: 18px;
            text-align: center;
        }
        .mm-mini-plan.popular {
            border: 1px solid var(--accent-indigo);
        }
        .mm-mini-plan .price {
            font-size: 1.3rem;
            font-weight: 700;
            margin: 4px 0;
        }
        .mm-mini-plan .label {
            color: var(--text-muted);
            font-size: 0.85rem;
        }

        .mm-footer-cta {
            text-align: center;
            padding: 44px 10px 30px 10px;
            border-top: 1px solid var(--border-subtle);
            margin-top: 40px;
        }
        .mm-footer-cta h3 {
            font-size: 1.3rem;
            margin-bottom: 8px;
        }
        .mm-footer-cta p {
            color: var(--text-muted);
            margin-bottom: 20px;
        }
        </style>
        """,
        unsafe_allow_html=True,
    )


def render_header() -> None:
    st.markdown(
        """
        <div class="mm-header">
            <span class="mm-logo">MargeMax</span>
            <span class="mm-bolt">⚡</span>
            <span class="mm-ali">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3b/AliExpress_logo.svg" alt="AliExpress" />
            </span>
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_trust_badges() -> None:
    st.markdown(
        """
        <div class="mm-trust-row">
            <span class="mm-trust-badge">🔒 Connexion sécurisée par Supabase Auth</span>
            <span class="mm-trust-badge">🛡️ Données cryptées</span>
            <span class="mm-trust-badge">✅ SSL</span>
        </div>
        """,
        unsafe_allow_html=True,
    )


# ============================================================
# CLIENT SUPABASE
# ============================================================

@st.cache_resource(show_spinner=False)
def get_supabase_client() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)


supabase = get_supabase_client()


# ============================================================
# ÉTAT DE SESSION
# ============================================================

def init_session_state() -> None:
    defaults = {
        "user": None,
        "profile": None,
        "page": "recherche",
        "public_page": "accueil",
        "last_result": None,
        "auth_error": None,
        "remember_me": False,
    }
    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value


def is_logged_in() -> bool:
    return st.session_state.get("user") is not None


def is_admin() -> bool:
    profile = st.session_state.get("profile")
    if not profile:
        return False
    if profile.get("is_admin") or profile.get("role") == "admin":
        return True
    user = st.session_state.get("user")
    return bool(user and user.get("email") == ADMIN_EMAIL)


def is_suspended() -> bool:
    profile = st.session_state.get("profile") or {}
    return bool(profile.get("is_suspended")) and not is_admin()


def has_active_subscription() -> bool:
    if is_admin():
        return True
    profile = st.session_state.get("profile") or {}
    plan = profile.get("plan", "free")
    expires_at = profile.get("plan_expires_at")
    if plan == "free":
        return False
    if not expires_at:
        return True
    try:
        expiry = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
        return expiry > datetime.now(timezone.utc)
    except ValueError:
        return True


def get_search_count() -> int:
    if not is_logged_in():
        return 0
    profile = st.session_state.get("profile") or {}
    return int(profile.get("searches_used") or 0)


def searches_remaining() -> int:
    if is_admin() or has_active_subscription():
        return math.inf
    return max(0, FREE_SEARCH_LIMIT - get_search_count())


def ad_slots_for_current_user() -> int:
    """Nombre de bannières pub à afficher : 2 (gratuit), 1 (Pass Flash), 0 (Pro / admin)."""
    if is_admin():
        return 0
    profile = st.session_state.get("profile") or {}
    plan = profile.get("plan", "free")
    if plan == "free":
        return 2
    if plan == "pass_flash" and has_active_subscription():
        return 1
    return 0


# ============================================================
# AUTHENTIFICATION
# ============================================================

def fetch_profile(user_id: str) -> dict | None:
    try:
        response = (
            supabase.table("profiles")
            .select("*")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        return response.data if response else None
    except Exception:
        return None


def ensure_profile_exists(user_id: str, email: str) -> dict:
    profile = fetch_profile(user_id)
    if profile:
        return profile
    new_profile = {
        "user_id": user_id,
        "email": email,
        "plan": "free",
        "searches_used": 0,
        "is_admin": email == ADMIN_EMAIL,
        "is_suspended": False,
    }
    try:
        supabase.table("profiles").insert(new_profile).execute()
    except Exception:
        pass
    return fetch_profile(user_id) or new_profile


def log_in(email: str, password: str, remember_me: bool) -> None:
    try:
        auth_response = supabase.auth.sign_in_with_password(
            {"email": email, "password": password}
        )
        user = auth_response.user
        if user is None:
            st.session_state["auth_error"] = "Identifiants incorrects. Merci de réessayer."
            return
        st.session_state["user"] = {"id": user.id, "email": user.email}
        st.session_state["profile"] = ensure_profile_exists(user.id, user.email)
        st.session_state["remember_me"] = remember_me
        st.session_state["auth_error"] = None
    except Exception as exc:
        st.session_state["auth_error"] = f"Connexion impossible : {exc}"


def sign_up(email: str, password: str) -> None:
    try:
        auth_response = supabase.auth.sign_up({"email": email, "password": password})
        user = auth_response.user
        if user is None:
            st.session_state["auth_error"] = "Inscription impossible. Merci de réessayer."
            return
        ensure_profile_exists(user.id, user.email)
        st.session_state["auth_error"] = None
        st.success("Compte créé ! Vous pouvez maintenant vous connecter.")
    except Exception as exc:
        st.session_state["auth_error"] = f"Inscription impossible : {exc}"


def log_out() -> None:
    try:
        supabase.auth.sign_out()
    except Exception:
        pass
    for key in ("user", "profile", "last_result", "remember_me"):
        st.session_state[key] = None
    st.session_state["page"] = "recherche"


def increment_search_count() -> None:
    if is_admin() or has_active_subscription():
        return
    profile = st.session_state.get("profile") or {}
    user = st.session_state.get("user")
    new_count = get_search_count() + 1
    profile["searches_used"] = new_count
    st.session_state["profile"] = profile
    if user:
        try:
            supabase.table("profiles").update({"searches_used": new_count}).eq(
                "user_id", user["id"]
            ).execute()
        except Exception:
            pass


def render_landing_page() -> None:
    render_header()

    st.markdown(
        """
        <div class="mm-hero">
            <h1>Trouvez vos prochains best-sellers AliExpress<br/>en quelques secondes</h1>
            <p>MargeMax calcule instantanément ton coût réel, ton prix de vente conseillé
            et ta marge nette pour chaque produit — avant même de le sourcer.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    col_left, col_mid, col_right = st.columns([1, 1, 1])
    with col_mid:
        if st.button("Commencer gratuitement — 3 recherches offertes", use_container_width=True):
            st.session_state["public_page"] = "auth"
            st.rerun()
        if st.button("J'ai déjà un compte — Se connecter", use_container_width=True):
            st.session_state["public_page"] = "auth"
            st.rerun()

    render_trust_badges()

    st.markdown('<div class="mm-section-title">Comment ça marche</div>', unsafe_allow_html=True)
    st.markdown(
        '<div class="mm-section-subtitle">Trois indicateurs, une seule recherche.</div>',
        unsafe_allow_html=True,
    )

    feat_col1, feat_col2, feat_col3 = st.columns(3)
    features = [
        ("💰", "Finance instantanée", "Coût réel, TVA estimée, prix de vente conseillé et marge nette calculés automatiquement."),
        ("🛡️", "Fiabilité vérifiée", "Un score de sourcing basé sur la note du vendeur et le volume de commandes, pour éviter les mauvaises surprises."),
        ("📈", "Potentiel marché", "Un score sur 100 et les canaux de vente les plus adaptés — TikTok Ads, Shopify ou Vinted."),
    ]
    for col, (icon, title, desc) in zip([feat_col1, feat_col2, feat_col3], features):
        with col:
            st.markdown(
                f"""
                <div class="mm-feature-card">
                    <div class="mm-feature-icon">{icon}</div>
                    <h4>{title}</h4>
                    <p>{desc}</p>
                </div>
                """,
                unsafe_allow_html=True,
            )

    st.markdown('<div class="mm-section-title">Des tarifs simples</div>', unsafe_allow_html=True)
    st.markdown(
        '<div class="mm-section-subtitle">Commence gratuitement, passe Pro quand tu es prêt.</div>',
        unsafe_allow_html=True,
    )

    pricing_cols = st.columns(4)
    mini_plans = [
        ("Gratuit", "0 €", "3 recherches", False),
        ("Pass Flash", "6,99 €/sem", "Illimité 7 jours", False),
        ("Pro Mensuel", "14,99 €/mois", "Illimité + favoris", False),
        ("Pro Annuel", "49,99 €/an", "Tout illimité", True),
    ]
    for col, (label, price, sub, popular) in zip(pricing_cols, mini_plans):
        with col:
            popular_class = "popular" if popular else ""
            st.markdown(
                f"""
                <div class="mm-mini-plan {popular_class}">
                    <div class="label">{label}</div>
                    <div class="price">{price}</div>
                    <div class="label">{sub}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

    st.markdown(
        """
        <div class="mm-footer-cta">
            <h3>Prêt à trouver ton prochain produit gagnant ?</h3>
            <p>Aucune carte bancaire requise pour démarrer.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )
    col_left2, col_mid2, col_right2 = st.columns([1, 1, 1])
    with col_mid2:
        if st.button("Créer mon compte gratuit", use_container_width=True, key="footer_cta"):
            st.session_state["public_page"] = "auth"
            st.rerun()


def render_auth_forms() -> None:
    if st.button("← Retour à l'accueil", key="back_to_landing"):
        st.session_state["public_page"] = "accueil"
        st.rerun()
    render_header()
    render_trust_badges()
    st.markdown("### Bienvenue sur MargeMax")
    st.caption("Connectez-vous pour lancer vos recherches de sourcing AliExpress.")

    tab_connexion, tab_inscription = st.tabs(["Se connecter", "Créer un compte"])

    with tab_connexion:
        with st.form("form_connexion"):
            email = st.text_input("Adresse e-mail", key="login_email")
            password = st.text_input("Mot de passe", type="password", key="login_password")
            remember_me = st.checkbox("Se souvenir de moi", value=True, key="login_remember")
            submitted = st.form_submit_button("Se connecter", use_container_width=True)
        if submitted:
            if not email or not password:
                st.session_state["auth_error"] = "Merci de renseigner votre e-mail et votre mot de passe."
            else:
                log_in(email, password, remember_me)
                if is_logged_in():
                    st.rerun()

    with tab_inscription:
        with st.form("form_inscription"):
            new_email = st.text_input("Adresse e-mail", key="signup_email")
            new_password = st.text_input(
                "Mot de passe (8 caractères minimum)", type="password", key="signup_password"
            )
            confirm_password = st.text_input(
                "Confirmer le mot de passe", type="password", key="signup_confirm"
            )
            submitted_signup = st.form_submit_button("Créer mon compte", use_container_width=True)
        if submitted_signup:
            if not new_email or not new_password:
                st.session_state["auth_error"] = "Merci de compléter tous les champs."
            elif new_password != confirm_password:
                st.session_state["auth_error"] = "Les mots de passe ne correspondent pas."
            elif len(new_password) < 8:
                st.session_state["auth_error"] = "Le mot de passe doit contenir au moins 8 caractères."
            else:
                sign_up(new_email, new_password)

    if st.session_state.get("auth_error"):
        st.error(st.session_state["auth_error"])


# ============================================================
# AliExpress — GATEWAY TOP
# ============================================================

def _sign_top_params(params: dict, app_secret: str) -> str:
    """Signature MD5 requise par le Gateway TOP AliExpress (méthode 'md5')."""
    sorted_items = sorted(params.items())
    base_string = app_secret + "".join(f"{k}{v}" for k, v in sorted_items) + app_secret
    return hashlib.md5(base_string.encode("utf-8")).hexdigest().upper()


def call_aliexpress_gateway(method: str, extra_params: dict) -> dict | None:
    """
    Appelle le Gateway TOP AliExpress. Nécessite ALIEXPRESS_APP_SECRET
    dans .streamlit/secrets.toml (non fourni par le AppKey seul).
    Retourne None si l'appel échoue, pour permettre un repli propre.
    """
    if not ALIEXPRESS_APP_SECRET:
        return None

    params = {
        "method": method,
        "app_key": ALIEXPRESS_APP_KEY,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "format": "json",
        "v": "2.0",
        "sign_method": "md5",
        **extra_params,
    }
    params["sign"] = _sign_top_params(params, ALIEXPRESS_APP_SECRET)

    try:
        response = requests.get(ALIEXPRESS_GATEWAY, params=params, timeout=8)
        response.raise_for_status()
        return response.json()
    except Exception:
        return None


def search_product(query: str) -> dict:
    """
    Recherche un produit sur AliExpress via le Gateway TOP.
    En l'absence de App Secret configuré (ou en cas d'échec réseau),
    une estimation de démonstration est générée pour ne jamais bloquer l'UI.
    """
    api_result = call_aliexpress_gateway(
        "aliexpress.affiliate.product.query", {"keywords": query, "page_size": "1"}
    )

    if api_result:
        # À adapter selon le schéma exact retourné par le Gateway TOP.
        return _parse_aliexpress_payload(api_result, query)

    return _generate_demo_estimate(query)


def _parse_aliexpress_payload(payload: dict, query: str) -> dict:
    # Squelette d'extraction — à ajuster une fois l'App Secret et la
    # méthode d'API définitive branchés en production.
    try:
        item = payload["aliexpress_affiliate_product_query_response"]["resp_result"][
            "result"
        ]["products"]["product"][0]
        base_price = float(item.get("target_sale_price", 0)) or 8.5
        shipping = 2.0
        image_url = item.get("product_main_image_url", "")
        vendor_rating = float(item.get("evaluate_rate", "92").replace("%", "")) / 100
        orders = int(item.get("volume", 500))
        title = item.get("product_title", query)
        return _build_result(title, base_price, shipping, image_url, vendor_rating, orders, query)
    except Exception:
        return _generate_demo_estimate(query)


def _generate_demo_estimate(query: str) -> dict:
    """Estimation déterministe (mode démo) tant que l'App Secret n'est pas configuré."""
    seed = int(hashlib.sha256(query.encode("utf-8")).hexdigest(), 16) % (10**6)
    rng = random.Random(seed)
    base_price = round(rng.uniform(3.5, 24.0), 2)
    shipping = round(rng.uniform(0.0, 4.5), 2)
    vendor_rating = round(rng.uniform(0.80, 0.99), 2)
    orders = rng.randint(80, 12000)
    image_url = "https://placehold.co/400x400/0F1117/38BDF8?text=MargeMax"
    return _build_result(query.title(), base_price, shipping, image_url, vendor_rating, orders, query)


def _build_result(
    title: str,
    base_price: float,
    shipping: float,
    image_url: str,
    vendor_rating: float,
    orders: int,
    query: str,
) -> dict:
    cout_total = round((base_price + shipping) * (1 + VAT_RATE), 2)
    prix_conseille = math.floor(cout_total / MARGIN_TARGET) + 0.99
    frais_paiement = round(prix_conseille * PAYMENT_FEE_RATE, 2)
    marge_nette = round(prix_conseille - cout_total - frais_paiement, 2)

    fiabilite_score = round(min(99, max(35, vendor_rating * 100 - (0 if orders > 300 else 15))))
    potentiel_score = round(min(99, max(20, 55 + (vendor_rating - 0.85) * 200 + (orders / 500))))

    canaux = []
    if potentiel_score >= 70:
        canaux.append("TikTok Ads")
    if base_price <= 15:
        canaux.append("Shopify")
    if base_price <= 8:
        canaux.append("Vinted")
    if not canaux:
        canaux.append("Shopify")

    return {
        "titre": title,
        "requete": query,
        "image_url": image_url,
        "prix_produit": base_price,
        "livraison": shipping,
        "cout_total": cout_total,
        "prix_conseille": round(prix_conseille, 2),
        "frais_paiement": frais_paiement,
        "marge_nette": marge_nette,
        "fiabilite_score": fiabilite_score,
        "note_produit": round(vendor_rating * 5, 1),
        "commandes": orders,
        "note_vendeur": round(vendor_rating * 5, 1),
        "potentiel_score": potentiel_score,
        "delai_livraison": "12-20 jours" if shipping < 3 else "7-15 jours",
        "canaux": canaux,
    }


# ============================================================
# COMPOSANTS UI — DASHBOARD RÉSULTATS
# ============================================================

def score_class(score: float) -> str:
    if score >= 75:
        return "mm-score-high"
    if score >= 50:
        return "mm-score-mid"
    return "mm-score-low"


def render_result_dashboard(result: dict) -> None:
    st.markdown(f"#### Résultats pour : *{result['titre']}*")
    col_finance, col_fiabilite, col_potentiel = st.columns(3)

    with col_finance:
        st.markdown(
            f"""
            <div class="mm-card">
                <h4>💰 Carte Finance</h4>
                <img src="{result['image_url']}" style="width:100%;border-radius:10px;margin-bottom:12px;" />
                <div class="mm-metric-row"><span class="label">Prix produit</span><span class="value">{result['prix_produit']:.2f} €</span></div>
                <div class="mm-metric-row"><span class="label">Livraison</span><span class="value">{result['livraison']:.2f} €</span></div>
                <div class="mm-metric-row"><span class="label">Coût total (TVA 20% incl.)</span><span class="value">{result['cout_total']:.2f} €</span></div>
                <div class="mm-metric-row"><span class="label">Prix de vente conseillé</span><span class="value">{result['prix_conseille']:.2f} €</span></div>
                <div class="mm-margin-highlight">Marge nette : {result['marge_nette']:.2f} €</div>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with col_fiabilite:
        cls = score_class(result["fiabilite_score"])
        st.markdown(
            f"""
            <div class="mm-card">
                <h4>🛡️ Fiabilité Sourcing</h4>
                <span class="mm-score-badge {cls}">{result['fiabilite_score']} %</span>
                <div class="mm-metric-row" style="margin-top:16px;"><span class="label">Note produit</span><span class="value">{result['note_produit']} / 5</span></div>
                <div class="mm-metric-row"><span class="label">Commandes</span><span class="value">{f"{result['commandes']:,}".replace(",", " ")}</span></div>
                <div class="mm-metric-row"><span class="label">Note vendeur</span><span class="value">{result['note_vendeur']} / 5</span></div>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with col_potentiel:
        cls_p = score_class(result["potentiel_score"])
        badges = "".join(f'<span class="mm-channel-badge">{c}</span>' for c in result["canaux"])
        st.markdown(
            f"""
            <div class="mm-card">
                <h4>📈 Potentiel Marché</h4>
                <span class="mm-score-badge {cls_p}">{result['potentiel_score']} / 100</span>
                <div class="mm-metric-row" style="margin-top:16px;"><span class="label">Délai de livraison</span><span class="value">{result['delai_livraison']}</span></div>
                <div style="margin-top:10px;">{badges}</div>
            </div>
            """,
            unsafe_allow_html=True,
        )


# ============================================================
# PAGE RECHERCHE
# ============================================================

def render_ad_banners() -> None:
    slots = ad_slots_for_current_user()
    if slots <= 0:
        return
    columns = st.columns(slots)
    for col in columns:
        with col:
            st.markdown(
                '<div class="mm-ad-banner">Espace publicitaire · Passez Pro pour le retirer</div>',
                unsafe_allow_html=True,
            )


def render_search_page() -> None:
    render_header()
    render_ad_banners()

    remaining = searches_remaining()
    if remaining != math.inf:
        st.info(f"Recherches gratuites restantes : {int(remaining)} / {FREE_SEARCH_LIMIT}")

    with st.form("form_recherche"):
        query = st.text_input(
            "Nom du produit à sourcer", placeholder="Ex : montre connectée sport"
        )
        submitted = st.form_submit_button("Lancer la recherche", use_container_width=True)

    if submitted:
        if not query.strip():
            st.warning("Merci de saisir un nom de produit.")
        elif remaining <= 0:
            st.session_state["page"] = "tarifs"
            st.rerun()
        else:
            with st.spinner("Analyse du produit en cours…"):
                time.sleep(0.4)
                result = search_product(query.strip())
            increment_search_count()
            st.session_state["last_result"] = result

    if st.session_state.get("last_result"):
        st.divider()
        render_result_dashboard(st.session_state["last_result"])


# ============================================================
# PAGE TARIFS
# ============================================================

def render_pricing_page() -> None:
    render_header()
    st.markdown("### Passez à l'offre Pro")
    st.caption("Recherches illimitées, 0 publicité, et bien plus.")

    columns = st.columns(3)
    plan_keys = list(PLANS.keys())

    for col, plan_key in zip(columns, plan_keys):
        plan = PLANS[plan_key]
        with col:
            popular_class = "popular" if plan["popular"] else ""
            badge_html = (
                '<div class="mm-plan-badge">OFFRE LA PLUS POPULAIRE</div>' if plan["popular"] else ""
            )
            features_html = "".join(f"<li>{f}</li>" for f in plan["features"])
            st.markdown(
                f"""
                <div class="mm-plan-card {popular_class}">
                    {badge_html}
                    <h3>{plan['label']}</h3>
                    <div style="font-size:1.8rem;font-weight:800;margin:10px 0;">
                        {plan['price']} <span style="font-size:0.9rem;color:#9CA3AF;">{plan['period']}</span>
                    </div>
                    <ul style="text-align:left;color:#D1D5DB;list-style:none;padding-left:0;">
                        {features_html}
                    </ul>
                </div>
                """,
                unsafe_allow_html=True,
            )
            if st.button(f"Choisir {plan['label']}", key=f"choose_{plan_key}", use_container_width=True):
                st.info(
                    "Le paiement en ligne arrive très bientôt. "
                    "Contacte-nous en attendant pour activer ton abonnement manuellement."
                )


# ============================================================
# SIDEBAR
# ============================================================

def render_sidebar() -> None:
    with st.sidebar:
        st.markdown("## MargeMax ⚡")

        if is_logged_in():
            if is_admin():
                st.markdown('<div class="mm-admin-badge">👑 ADMIN PRO</div>', unsafe_allow_html=True)
            else:
                plan = (st.session_state.get("profile") or {}).get("plan", "free")
                plan_label = PLANS.get(plan, {}).get("label", "Plan Gratuit")
                st.caption(f"Plan actuel : **{plan_label}**")

            st.caption(f"Connecté : {st.session_state['user']['email']}")
            st.divider()

            st.session_state["page"] = st.radio(
                "Navigation",
                options=["recherche", "tarifs"],
                format_func=lambda p: "🔍 Recherche" if p == "recherche" else "💳 Tarifs",
                index=0 if st.session_state.get("page") == "recherche" else 1,
                label_visibility="collapsed",
            )

            st.divider()
            if st.button("Se déconnecter", use_container_width=True):
                log_out()
                st.rerun()
        else:
            st.caption("Connectez-vous pour commencer à sourcer vos produits.")


# ============================================================
# POINT D'ENTRÉE
# ============================================================

def main() -> None:
    init_session_state()
    inject_custom_css()

    if not is_logged_in():
        if st.session_state.get("public_page") == "auth":
            render_auth_forms()
        else:
            render_landing_page()
        return

    render_sidebar()

    if is_suspended():
        render_header()
        st.error(
            "Ton compte a été suspendu. Contacte le support MargeMax si tu penses "
            "qu'il s'agit d'une erreur."
        )
        return

    if st.session_state["page"] == "tarifs":
        render_pricing_page()
    else:
        render_search_page()


if __name__ == "__main__":
    main()
