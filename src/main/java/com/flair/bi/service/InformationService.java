package com.flair.bi.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.flair.bi.domain.Information;
import com.flair.bi.repository.InformationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InformationService {

	private final InformationRepository informationRepository;

	public List<Information> getAll() {
		return informationRepository.findAll();
	}

	public List<Information> getAll(Boolean isDesktop) {
		return informationRepository.findByIsDesktop(isDesktop);
	}
}
