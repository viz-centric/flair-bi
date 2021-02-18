package com.flair.bi.web.rest;


import com.flair.bi.service.email.EmailVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;
import org.springframework.web.servlet.view.RedirectView;

@Controller
@RequestMapping("/verify_email")
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationResource {

    private final EmailVerificationService emailVerificationService;

    @Value("${app.hostname}")
    private String hostname;

    @GetMapping("/confirm")
    public RedirectView confirm(@RequestParam(value = "token") String token,
                                RedirectAttributes attributes) {
        log.info("Confirming email for token {}", token);
        emailVerificationService.confirmEmail(token);

        attributes.addAttribute("token", token);
        return new RedirectView(hostname + "/realm");
    }
}
