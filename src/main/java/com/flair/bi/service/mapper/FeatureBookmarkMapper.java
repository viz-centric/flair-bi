package com.flair.bi.service.mapper;

import com.flair.bi.domain.FeatureBookmark;
import com.flair.bi.service.dto.FeatureBookmarkDTO;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {})
public interface FeatureBookmarkMapper {

    FeatureBookmarkDTO featureBookmarkToFeatureBookmarkDTO(FeatureBookmark featureBookmark);

    FeatureBookmark featureBookmarkDTOtoFeatureBookmark(FeatureBookmarkDTO featureBookmarkDTO);

    List<FeatureBookmark> featureBookmarkDTOsToFeatureBookmarks(List<FeatureBookmarkDTO> featureBookmarkDTOS);

    List<FeatureBookmarkDTO> featureBookmarksToFeatureBookmarkDTOs(List<FeatureBookmark> fieldTypes);
}
