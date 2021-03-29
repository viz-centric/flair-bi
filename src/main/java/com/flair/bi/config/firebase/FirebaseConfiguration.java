package com.flair.bi.config.firebase;

import com.flair.bi.view.IViewStateRepository;
import com.flair.bi.view.ViewStateFirestoreRepository;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.OAuth2Credentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;

@Configuration
public class FirebaseConfiguration {

    @ConditionalOnProperty(value = "app.firebase.enabled", havingValue = "true")
    @Bean
    @Qualifier("firebaseCredentials")
    public OAuth2Credentials googleCredentials(FirebaseProperties firebaseProperties) throws Exception {
        String googleAppCredFile = firebaseProperties.getGoogleAppCredFile();

        try (FileInputStream serviceAccount = new FileInputStream(googleAppCredFile)) {
            GoogleCredentials googleCredentials = GoogleCredentials.fromStream(serviceAccount);
            initFirebase(googleCredentials);
            return googleCredentials;
        }
    }

    @ConditionalOnProperty(value = "app.firebase.enabled", havingValue = "false")
    @Bean
    @Qualifier("firebaseCredentials")
    public OAuth2Credentials googleCredentialsNoFirebase() throws Exception {
        return OAuth2Credentials.create(null);
    }

    private void initFirebase(GoogleCredentials googleCredentials) {
        FirebaseOptions options = new FirebaseOptions.Builder()
                .setCredentials(googleCredentials)
                .build();
        FirebaseApp.initializeApp(options);
    }

    @ConditionalOnProperty(value = "app.firebase.enabled", havingValue = "true")
    @Bean
    public IViewStateRepository viewStateRepository(OAuth2Credentials googleCredentials) {
        return new ViewStateFirestoreRepository();
    }

}
