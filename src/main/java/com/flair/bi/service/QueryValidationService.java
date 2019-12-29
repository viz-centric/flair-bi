package com.flair.bi.service;

import com.project.bi.query.dto.FieldDTO;
import com.project.bi.query.dto.HavingDTO;
import com.project.bi.query.dto.QueryDTO;
import com.project.bi.query.dto.SortDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

import static java.util.stream.Collectors.toList;

@Service
@RequiredArgsConstructor
@Slf4j
public class QueryValidationService {

    private static final Pattern FIELD_REGEX = Pattern.compile("[0-9a-zA-Z_]+");

    public QueryValidationResult validate(QueryDTO queryDTO) {
        log.info("Validate query {}", queryDTO);
        List<QueryValidationError> selectFieldsValidationResult = validateFields(queryDTO.getFields());
        if (!selectFieldsValidationResult.isEmpty()) {
            return QueryValidationResult.builder()
                    .errors(selectFieldsValidationResult)
                    .group(QueryValidationResult.Group.SELECT)
                    .build();
        }

        List<QueryValidationError> groupByValidationResult = validateFields(queryDTO.getGroupBy());
        if (!groupByValidationResult.isEmpty()) {
            return QueryValidationResult.builder()
                    .errors(groupByValidationResult)
                    .group(QueryValidationResult.Group.GROUP_BY)
                    .build();
        }

        List<QueryValidationError> orderByValidationResult = validateOrders(queryDTO.getOrders());
        if (!orderByValidationResult.isEmpty()) {
            return QueryValidationResult.builder()
                    .errors(orderByValidationResult)
                    .group(QueryValidationResult.Group.ORDER_BY)
                    .build();
        }

        List<QueryValidationError> havingResult = validateHavings(queryDTO.getHaving());
        if (!havingResult.isEmpty()) {
            return QueryValidationResult.builder()
                    .errors(havingResult)
                    .group(QueryValidationResult.Group.HAVING)
                    .build();
        }

        return QueryValidationResult.builder()
                .build();
    }

    private List<QueryValidationError> validateOrders(List<SortDTO> orders) {
        return orders.stream()
                .map(order -> validateOrder(order))
                .filter(optional -> optional.isPresent())
                .map(optional -> optional.get())
                .collect(toList());
    }

    private Optional<QueryValidationError> validateOrder(SortDTO order) {
        return validateField(order.getFeature());
    }

    private List<QueryValidationError> validateHavings(List<HavingDTO> havings) {
        return havings.stream()
                .map(having -> validateHaving(having))
                .filter(optional -> optional.isPresent())
                .map(optional -> optional.get())
                .collect(toList());
    }

    private Optional<QueryValidationError> validateHaving(HavingDTO having) {
        Optional<QueryValidationError> validationError = validateField(having.getFeature());
        if (validationError.isPresent()) {
            return validationError;
        }
        if (!StringUtils.isEmpty(having.getValue())
                && !FIELD_REGEX.matcher(having.getValue()).matches()) {
            return Optional.ofNullable(
                    QueryValidationError.of(having.getValue(),
                            "HavingValueInvalid")
            );
        }
        return Optional.empty();
    }

    private List<QueryValidationError> validateFields(List<FieldDTO> fields) {
        return fields.stream()
                .map(field -> validateField(field))
                .filter(field -> field.isPresent())
                .map(field -> field.get())
                .collect(toList());
    }

    private Optional<QueryValidationError> validateField(FieldDTO field) {
        if (!StringUtils.isEmpty(field.getAggregation())
                && !FIELD_REGEX.matcher(field.getAggregation()).matches()) {
            return Optional.ofNullable(
                    QueryValidationError.of(field.getAggregation(),
                    "FieldAggregationInvalid")
            );
        }
        if (!StringUtils.isEmpty(field.getName())
                && !FIELD_REGEX.matcher(field.getName()).matches()) {
            return Optional.ofNullable(
                    QueryValidationError.of(field.getName(),
                    "FieldNameInvalid")
            );
        }
        if (!StringUtils.isEmpty(field.getAlias())
                && !FIELD_REGEX.matcher(field.getAlias()).matches()) {
            return Optional.ofNullable(
                    QueryValidationError.of(field.getAlias(),
                    "FieldAliasInvalid")
            );
        }
        return Optional.empty();
    }
}
