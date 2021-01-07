package com.flair.bi.web.rest;


import com.flair.bi.service.email.EmailVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/verify_email")
@RequiredArgsConstructor
@Slf4j
public class EmailVerificationResource {

    private final EmailVerificationService emailVerificationService;

    @GetMapping("/confirm")
    public ResponseEntity<?> confirm(@RequestParam(value = "token") String token) {
        log.info("Confirming email for token {}", token);
        emailVerificationService.confirmEmail(token);
        return ResponseEntity.ok("");
    }
}
