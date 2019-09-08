package com.flair.bi.service.properttype;

import com.flair.bi.domain.listeners.PropertyTypeListener;
import com.flair.bi.domain.propertytype.PropertyType;
import com.flair.bi.domain.propertytype.SelectPropertyType;
import com.flair.bi.repository.PropertyTypeRepository;
import com.flair.bi.service.dto.PropertyTypeDTO;
import com.flair.bi.service.mapper.PropertyTypeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class PropertyTypeServiceImpl implements PropertyTypeService {

    private final PropertyTypeRepository propertyTypeRepository;
    private final PropertyTypeMapper propertyTypeMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<PropertyType> findAll(Pageable pageable) {
        return propertyTypeRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public PropertyType findById(Long id) {
        final PropertyType propertyType = propertyTypeRepository.findOne(id);

        if (propertyType instanceof SelectPropertyType) {
            ((SelectPropertyType) propertyType).getPossibleValues().size();//fetch possible values
        }
        return propertyType;

    }

    @Override
    public PropertyType save(PropertyType type) {
        type = PropertyTypeListener.rewireRelationships(type);
        return propertyTypeRepository.save(type);
    }

    @Override
    public void delete(long id) {
        propertyTypeRepository.delete(id);
    }

    @Override
    public PropertyTypeDTO save(PropertyTypeDTO propertyTypeDTO) {
        PropertyType propertyType = propertyTypeMapper.propertyTypeDTOToPropertyType(propertyTypeDTO);
        PropertyType saved = save(propertyType);
        return propertyTypeMapper.propertyTypeToPropertyTypeDTO(saved);
    }
}
