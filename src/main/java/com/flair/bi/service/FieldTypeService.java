package com.flair.bi.service;

import com.flair.bi.domain.fieldtype.FieldType;
import com.flair.bi.domain.propertytype.PropertyType;
import com.flair.bi.repository.FieldTypeRepository;
import com.flair.bi.repository.PropertyTypeRepository;
import com.flair.bi.web.rest.errors.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class FieldTypeService {

    private final FieldTypeRepository fieldTypeRepository;

    private final PropertyTypeRepository propertyTypeRepository;

    public FieldType getOne(Long id) {
        return fieldTypeRepository.getOne(id);
    }

    public FieldType assignPropertyType(Long fieldTypeId, Long propertyTypeId) {
        final PropertyType propertyType = propertyTypeRepository.findOne(propertyTypeId);

        if (null == propertyType) {
            throw new EntityNotFoundException();
        }

        return Optional.ofNullable(fieldTypeRepository.findOne(fieldTypeId))
            .map(x -> x.addPropertyType(propertyType))
            .map(fieldTypeRepository::save)
            .orElseThrow(EntityNotFoundException::new);
    }

    public FieldType removePropertyType(Long fieldTypeId, Long propertyTypeId) {
        return Optional.ofNullable(fieldTypeRepository.findOne(fieldTypeId))
            .map(x -> x.removePropertyType(propertyTypeId))
            .map(fieldTypeRepository::save)
            .orElseThrow(EntityNotFoundException::new);
    }
}
