package com.flair.bi.service.email;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGridAPI;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Email;
import com.sendgrid.helpers.mail.objects.Personalization;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class SendGridService {

    private static final String CONFIRM_EMAIL_TEMPLATE_ID = "d-c3ef7b417cac406ab50b40dd19f688aa";

    private final SendGridAPI sendGridAPI;

    public void sendConfirmYourEmailEmail(String email, String customerName, String confirmationToken) {
        Email from = new Email(email, customerName);

        Personalization personalization = new Personalization();
        personalization.addDynamicTemplateData("confirmation_token", confirmationToken);
        personalization.addTo(from);

        Mail mail = new Mail();
        mail.setTemplateId(CONFIRM_EMAIL_TEMPLATE_ID);
        mail.addPersonalization(personalization);
        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sendGridAPI.api(request);
            log.debug("Confirm your email email to email {} has been send with the response {}", email, response.getBody());
        } catch (IOException ex) {
            throw new RuntimeException("Error sending confirm your email email " + email);
        }
    }

}
