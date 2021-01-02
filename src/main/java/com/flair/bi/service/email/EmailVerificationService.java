package com.flair.bi.service.email;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGridAPI;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationService {

    private final SendGridAPI sendGridAPI;

    public void sendConfirmYourEmailEmail(String email) {
        Email from = new Email("from@example.com", "Foo Bar");
        String subject = "Test email with SendGrid";
        Email to = new Email(email);
        Content content = new Content("text/plain", "Test email with Spring");
        Mail mail = new Mail(from, subject, to, content);
        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sendGridAPI.api(request);
            log.info("Confirm your email email to email {} has been send with the response {}", email, response.getBody());
        } catch (IOException ex) {
            log.error("Error sending confirm your email email {}", email, ex);
        }
    }
}
