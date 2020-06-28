package com.flair.bi.web.rest;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flair.bi.service.AuditEventService;
import com.flair.bi.service.dto.CountDTO;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PublicAuditResource {

	private final AuditEventService auditEventService;

	@GetMapping("/audits/authenticationSuccess/count")
	@PreAuthorize("isAuthenticated()")
	public CountDTO getSuccessLoginCount() {
		return new CountDTO(auditEventService.authenticationSuccessCount());
	}
}
