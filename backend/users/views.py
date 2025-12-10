# backend/users/views.py
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden
from django.utils.translation import gettext_lazy as _


@login_required
def password_change_disabled(request, *args, **kwargs):
    return HttpResponseForbidden(
        _(
            "Смена пароля недоступна. "
            "Обратитесь к администратору системы, если вам нужно обновить пароль."
        )
    )
