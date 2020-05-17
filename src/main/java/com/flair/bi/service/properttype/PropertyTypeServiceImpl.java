package com.flair.bi.service.properttype;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flair.bi.domain.listeners.PropertyTypeListener;
import com.flair.bi.domain.propertytype.PropertyType;
import com.flair.bi.domain.propertytype.SelectPropertyType;
import com.flair.bi.repository.PropertyTypeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class PropertyTypeServiceImpl implements PropertyTypeService {

	private final PropertyTypeRepository propertyTypeRepository;

	@Override
	@Transactional(readOnly = true)
	public Page<PropertyType> findAll(Pageable pageable) {
		return propertyTypeRepository.findAll(pageable);
	}

	@Override
	@Transactional(readOnly = true)
	public PropertyType findById(Long id) {
		final PropertyType propertyType = propertyTypeRepository.getOne(id);

		if (propertyType instanceof SelectPropertyType) {
			((SelectPropertyType) propertyType).getPossibleValues().size();// fetch possible values
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
		propertyTypeRepository.deleteById(id);
	}
}
