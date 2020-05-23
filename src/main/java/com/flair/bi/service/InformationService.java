package com.flair.bi.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flair.bi.domain.Information;
import com.flair.bi.repository.InformationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class InformationService {

	private final InformationRepository informationRepository;

	@Transactional(readOnly = true)
	public List<Information> getAll() {
		return informationRepository.findAll();
	}

	@Transactional(readOnly = true)
	public List<Information> getAll(Boolean isDesktop) {
		return informationRepository.findByIsDesktop(isDesktop);
	}
}
