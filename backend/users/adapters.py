from allauth.account.adapter import DefaultAccountAdapter


class NoSignupAccountAdapter(DefaultAccountAdapter):
    """
    Адаптер аккаунтов, полностью запрещающий регистрацию пользователей через сайт.
    Пользователей создаёт только администратор через админку.
    """

    def is_open_for_signup(self, request):
        # Всегда запрещаем регистрацию
        return False
