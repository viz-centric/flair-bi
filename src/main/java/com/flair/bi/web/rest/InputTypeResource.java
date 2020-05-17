package com.flair.bi.web.rest;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flair.bi.domain.enumeration.InputType;

import io.micrometer.core.annotation.Timed;

@RestController
@RequestMapping("/api")
public class InputTypeResource {

    @GetMapping("/inputTypes")
    @Timed
    public List<String> getAllInputTypes() {
        return Stream.of(InputType.values())
            .map(InputType::getValue)
            .map(String::toUpperCase)
            .collect(Collectors.toList());
    }
}
