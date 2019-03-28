package com.flair.bi.service;

import com.flair.bi.domain.hierarchy.Hierarchy;
import com.flair.bi.repository.HierarchyRepository;
import com.flair.bi.service.dto.HierarchyDTO;
import com.flair.bi.service.mapper.HierarchyMapper;
import com.google.common.collect.Lists;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class HierarchyService {

    private final HierarchyRepository hierarchyRepository;
    private final HierarchyMapper hierarchyMapper;

    @Transactional(readOnly = true)
    public List<Hierarchy> findAll(Predicate predicate) {
        return (List<Hierarchy>) hierarchyRepository.findAll(predicate);
    }

    @Transactional(readOnly = true)
    public List<HierarchyDTO> findAllAsDto(Predicate predicate) {
        List<Hierarchy> hierarchies = Lists.newArrayList(hierarchyRepository.findAll(predicate));
        return hierarchyMapper.hierarchiesToHierarchyDTOs(hierarchies)
                .stream()
                .peek(h -> {
                    h.getDrilldown()
                            .forEach(d -> {
                                d.setHierarchyId(h.getId());
                                d.getFeature().setHierarchyId(h.getId());
                            });
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Hierarchy findOne(Long id) {
        return hierarchyRepository.getOne(id);
    }

    @Transactional(readOnly = true)
    public HierarchyDTO findOneAsDTO(Long id) {
        return hierarchyMapper.hierarchyToHierarchyDTO(hierarchyRepository.getOne(id));
    }

    public Hierarchy save(Hierarchy hierarchy) {
        return hierarchyRepository.save(hierarchy);
    }

    public HierarchyDTO save(HierarchyDTO hierarchy) {
        return hierarchyMapper.hierarchyToHierarchyDTO(hierarchyRepository.save(hierarchyMapper.hierarchyDTOtoHierarchy(hierarchy)));
    }


    public void delete(Long id) {
        hierarchyRepository.delete(id);
    }
}
