package com.flair.bi.service.properttype;

import com.flair.bi.domain.propertytype.PropertyType;
import com.flair.bi.service.dto.PropertyTypeDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PropertyTypeService {

    Page<PropertyType> findAll(Pageable pageable);

    PropertyType findById(Long id);

    PropertyType save(PropertyType type);

    void delete(long id);

    PropertyTypeDTO save(PropertyTypeDTO propertyTypeDTO);
}
