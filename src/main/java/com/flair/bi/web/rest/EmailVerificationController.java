package com.flair.bi.web.rest;


import com.flair.bi.service.email.EmailVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController("/api/verify_email")
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationController {

    private final EmailVerificationService emailVerificationService;

    @GetMapping("/confirm")
    public void confirm(@RequestParam("token") String token) {
        log.info("Confirming email for token {}", token);
        emailVerificationService.confirmEmail(token);
    }
}
