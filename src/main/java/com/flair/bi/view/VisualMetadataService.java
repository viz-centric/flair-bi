package com.flair.bi.view;

import com.flair.bi.domain.visualmetadata.VisualMetadata;

import java.io.Serializable;
import java.util.List;

/**
 * Service for managing {@link VisualMetadata}
 */
public interface VisualMetadataService {
    /**
     * Save a visualMetadata.
     *
     * @param viewId         if od a view
     * @param visualMetadata the entity to save
     * @return the persisted entity
     */
    VisualMetadata save(Long viewId, VisualMetadata visualMetadata);

    /**
     * Retrieve all visual metadatas that user has an access to
     *
     * @param viewId identifier of the view
     * @return collection of visual metadata
     */
    List<VisualMetadata> findAllByPrincipalPermissionsByViewId(Serializable viewId);

    /**
     * Get one visualmetadata by id.
     *
     * @param id the id of the entity
     * @return the entity
     */
    VisualMetadata findOne(String id);

    /**
     * Delete the  visualmetadata by id.
     *
     * @param id the id of the entity
     */
    void delete(String id);

}
