package com.flair.bi.service;

import com.flair.bi.domain.Dashboard;
import com.flair.bi.domain.Feature;
import com.flair.bi.domain.QFeature;
import com.flair.bi.domain.View;
import com.flair.bi.domain.field.Field;
import com.flair.bi.domain.hierarchy.Hierarchy;
import com.flair.bi.domain.hierarchy.QHierarchy;
import com.flair.bi.domain.visualmetadata.VisualMetadata;
import com.flair.bi.view.ViewService;
import com.flair.bi.view.VisualMetadataService;
import com.flair.bi.view.export.ViewExportDTO;
import com.flair.bi.view.export.ViewImportResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Slf4j
@RequiredArgsConstructor
@Service
public class ViewExportImportService {

    private final DashboardService dashboardService;
    private final ViewService viewService;
    private final VisualMetadataService visualMetadataService;
    private final FeatureService featureService;
    private final HierarchyService hierarchyService;

    @Transactional(rollbackFor = Exception.class)
    public ViewImportResult importView(Long dashboardId, ViewExportDTO viewExportDTO) throws ViewExportImportException {
        log.debug("Importing dashboard {} view {}", dashboardId, viewExportDTO);
        final Dashboard dashboard = dashboardService.findOne(dashboardId);

        viewExportDTO.getEditState().setId(null);
        viewExportDTO.getEditState().setRevision(null);

        View view = ViewExportDTO.to(viewExportDTO);
        view.setViewDashboard(dashboard);
        View savedView = viewService.save(view);

        Set<VisualMetadata> visualMetadataSet = Optional.ofNullable(viewExportDTO.getEditState())
                .map(editState -> editState.getVisualMetadataSet())
                .orElseGet(() -> new HashSet<>());

        for (VisualMetadata vm : visualMetadataSet) {
            vm.setId(null);
            patchFields(vm, dashboard);
            visualMetadataService.save(savedView.getId(), vm);
        }

        ViewImportResult result = new ViewImportResult();
        result.setId(savedView.getId());
        return result;
    }

    private void patchFields(VisualMetadata vm, Dashboard dashboard) throws ViewExportImportException {
        for (Field field : vm.getFields()) {
            patchFeature(dashboard, field);
            patchHierarchy(dashboard, field);
        }
    }

    private void patchHierarchy(Dashboard dashboard, Field field) throws ViewExportImportException {
        if (field.getHierarchy() != null) {
            List<Hierarchy> hierarchies = hierarchyService.findAll(QHierarchy.hierarchy.datasource.eq(dashboard.getDashboardDatasource())
                    .and(QHierarchy.hierarchy.name.eq(field.getHierarchy().getName())));
            if (hierarchies.size() > 1) {
                throw new ViewExportImportException("Import failure", field.getHierarchy().getName(), ViewExportImportException.Kind.HIERARCHIES, ViewExportImportException.Type.MULTIPLE);
            } else if (hierarchies.isEmpty()) {
                throw new ViewExportImportException("Import failure", field.getHierarchy().getName(), ViewExportImportException.Kind.HIERARCHIES, ViewExportImportException.Type.NONE);
            }
            field.setHierarchy(hierarchies.get(0));
        }
    }

    private void patchFeature(Dashboard dashboard, Field field) throws ViewExportImportException {
        if (field.getFeature() != null) {
            List<Feature> features = featureService.getFeatures(QFeature.feature.datasource.eq(dashboard.getDashboardDatasource())
                    .and(QFeature.feature.name.eq(field.getFeature().getName())));
            if (features.size() > 1) {
                throw new ViewExportImportException("Import failure", field.getFeature().getName(), ViewExportImportException.Kind.FEATURES, ViewExportImportException.Type.MULTIPLE);
            } else if (features.isEmpty()) {
                throw new ViewExportImportException("Import failure", field.getFeature().getName(), ViewExportImportException.Kind.FEATURES, ViewExportImportException.Type.NONE);
            }
            field.setFeature(features.get(0));
        }
    }

}
