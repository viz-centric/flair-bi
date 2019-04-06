import angular from 'angular';

import { name as languageName, constants as languageConstants } from './language.constants';
import { name as languageControllerName, JhiLanguageController as JhiLanguageController } from './language.controller';
import { name as languageFilterName, findLanguageFromKey } from './language.filter';
import { name as languageServiceName, JhiLanguageService } from './language.service';

export const moduleName =
    angular.module('application.language', [])
        .constant(languageName, languageConstants)
        .controller(languageControllerName, JhiLanguageController)
        .filter(languageFilterName, findLanguageFromKey)
        .factory(languageServiceName, JhiLanguageService)
        .name;
