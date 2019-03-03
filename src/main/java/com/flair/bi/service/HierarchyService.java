package com.flair.bi.service;

import com.flair.bi.domain.hierarchy.Hierarchy;
import com.flair.bi.repository.HierarchyRepository;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class HierarchyService {

    private final HierarchyRepository hierarchyRepository;

    @Transactional(readOnly = true)
    public List<Hierarchy> findAll(Predicate predicate) {
        return (List<Hierarchy>) hierarchyRepository.findAll(predicate);
    }

    @Transactional(readOnly = true)
    public Hierarchy findOne(Long id) {
        return hierarchyRepository.getOne(id);
    }

    public Hierarchy save(Hierarchy hierarchy) {
        return hierarchyRepository.save(hierarchy);
    }


    public void delete(Long id) {
        hierarchyRepository.delete(id);
    }
}
