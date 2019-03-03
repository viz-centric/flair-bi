package com.flair.bi;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "application", ignoreUnknownFields = false)
@Getter
@Setter
public class ApplicationProperties {

    private final FbiEngine fbiEngine = new FbiEngine();

    @Getter
    @Setter
    public static class FbiEngine {

        private final Authentication authentication = new Authentication();

        @Getter
        @Setter
        public static class Authentication {

            private final Pki pki = new Pki();

            private final BasicAuthentication basicAuthentication = new BasicAuthentication();

            @Getter
            @Setter
            public static class Pki {

                private String keyStore;

                private String keyStorePassword;

                private String keyPassword;

                private String trustStore;

                private String trustStorePassword;

                private boolean enabled;
            }

            @Getter
            @Setter
            public static class BasicAuthentication {

                private String username;

                private String password;

                private boolean enabled;
            }

        }


    }


}
