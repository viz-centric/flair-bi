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

@Service
@RequiredArgsConstructor
@Slf4j
public class SendGridService {

    private static final String CONFIRM_EMAIL_TEMPLATE_ID = "d-c3ef7b417cac406ab50b40dd19f688aa";

    private final SendGridAPI sendGridAPI;
    private final SendGridProps sendGridProps;

    public void sendConfirmYourEmailEmail(String email, String customerName, String confirmationToken) {
        Email from = new Email(email, customerName);

        Personalization personalization = new Personalization();
        personalization.addDynamicTemplateData("confirmation_token", confirmationToken);
        personalization.addTo(from);

        sendEmailTemplate(email, personalization, CONFIRM_EMAIL_TEMPLATE_ID);
    }

    private void sendEmailTemplate(String email, Personalization personalization, String templateId) {
        Mail mail = new Mail();
        mail.setFrom(new Email(sendGridProps.getSender().getEmail(), sendGridProps.getSender().getName()));
        mail.setTemplateId(templateId);
        mail.addPersonalization(personalization);
        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sendGridAPI.api(request);
            log.debug("Email {} has been send with the response {}", email, response.getBody());
            if (response.getStatusCode() >= 400) {
                throw new RuntimeException("Error sending email with status code " + response.getBody());
            }
        } catch (Exception ex) {
            throw new RuntimeException("Error sending email " + email, ex);
        }
    }

}
