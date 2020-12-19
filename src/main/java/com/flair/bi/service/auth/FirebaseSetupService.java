package com.flair.bi.service.auth;

import com.flair.bi.config.firebase.FirebaseProperties;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;

@Service
public class FirebaseSetupService {

    public FirebaseSetupService(FirebaseProperties firebaseProperties) throws Exception {
        if (!firebaseProperties.isEnabled()) {
            return;
        }
        try (FileInputStream serviceAccount = new FileInputStream(firebaseProperties.getGoogleAppCredFile())) {
            FirebaseOptions options = new FirebaseOptions.Builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();
            FirebaseApp.initializeApp(options);
        }
    }
}
