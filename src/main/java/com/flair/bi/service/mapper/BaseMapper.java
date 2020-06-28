package com.flair.bi.service.mapper;

import java.util.List;

public interface BaseMapper<TO, FROM> {

	TO toDTO(FROM item);

	FROM fromDTO(TO dto);

	List<FROM> fromDTOCollection(List<TO> dtoList);

	List<TO> toDTOCollection(List<FROM> itemList);

}
