package com.flair.bi.web.rest;

import com.codahale.metrics.annotation.Timed;
import com.flair.bi.domain.fieldtype.FieldType;
import com.flair.bi.service.FieldTypeService;
import com.flair.bi.service.dto.IdentifierDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FieldTypeResource {

    private final FieldTypeService fieldTypeService;

    @PostMapping("/fieldTypes/{id}/propertyTypes")
    @Timed
    public ResponseEntity<FieldType> assignPropertyType(@PathVariable Long id, @RequestBody IdentifierDTO<Long> propertyType) {
        return ResponseEntity.ok(fieldTypeService.assignPropertyType(id, propertyType.getId()));
    }

    @DeleteMapping("/fieldTypes/{id}/propertyTypes/{propertyTypeId}")
    @Timed
    public ResponseEntity<FieldType> removePropertyType(@PathVariable Long id, @PathVariable Long propertyTypeId) {
        return ResponseEntity.ok(fieldTypeService.removePropertyType(id, propertyTypeId));
    }
}
