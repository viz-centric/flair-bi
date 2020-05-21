package com.flair.bi.web.rest;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flair.bi.domain.enumeration.Constraint;

import io.micrometer.core.annotation.Timed;

@RestController
@RequestMapping("/api")
public class ConstraintResource {

	@GetMapping("/constraints")
	@Timed
	public List<String> getAllConstraints() {
		return Arrays.stream(Constraint.values()).map(Constraint::getValue).collect(Collectors.toList());
	}

}
