import angular from 'angular';

import { name as AccountName, Account } from './account.service';
import { name as ActivateName, Activate } from './activate.service';
import { name as AuthName, Auth } from './auth.service';
import { name as AuthServerProviderName, AuthServerProvider } from './auth.session.service';
import { name as CryptoServiceName, CryptoService } from './crypto.service';
import { name as hasAnyAuthorityName, hasAnyAuthority } from './has-any-authority.directive';
import { name as hasAuthorityName, hasAuthority } from './has-authority.directive';
import { Config as JwtConfig } from './jwt.config';
import { name as PasswordResetFinishName, PasswordResetFinish } from './password-reset-finish.service';
import { name as PasswordResetInitName, PasswordResetInit } from './password-reset-init.service';
import { name as PasswordServiceName, Password } from './password.service';
import { name as AccountDispatchName, AccountDispatch } from './permissions-dispatch.service';
import { name as PrincipalName, Principal } from './principal.service';
import { name as RegisterName, Register } from './register.service';
import { name as SessionsName, Sessions } from "./sessions.service";
import { name as userTypeName, userType } from "./user-type.directive";

export const moduleName =
    angular.module('application.auth',

        ['angular-jwt'])

        .factory(AccountName, Account)
        .factory(ActivateName, Activate)
        .factory(AuthName, Auth)
        .factory(AuthServerProviderName, AuthServerProvider)
        .factory(CryptoServiceName, CryptoService)
        .factory(PasswordResetFinishName, PasswordResetFinish)
        .factory(PasswordResetInitName, PasswordResetInit)
        .factory(PasswordServiceName, Password)
        .factory(AccountDispatchName, AccountDispatch)
        .factory(PrincipalName, Principal)
        .factory(RegisterName, Register)
        .factory(SessionsName, Sessions)

        .directive(hasAnyAuthorityName, hasAnyAuthority)
        .directive(hasAuthorityName, hasAuthority)
        .directive(userTypeName, userType)

        .config(JwtConfig)

        .name;
