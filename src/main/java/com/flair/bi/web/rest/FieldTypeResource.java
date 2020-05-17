package com.flair.bi.web.rest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flair.bi.domain.fieldtype.FieldType;
import com.flair.bi.service.FieldTypeService;
import com.flair.bi.service.dto.IdentifierDTO;

import io.micrometer.core.annotation.Timed;
import lombok.RequiredArgsConstructor;

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
