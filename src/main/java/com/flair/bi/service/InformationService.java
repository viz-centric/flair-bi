package com.flair.bi.service;

import com.flair.bi.domain.Information;
import com.flair.bi.repository.InformationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

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
