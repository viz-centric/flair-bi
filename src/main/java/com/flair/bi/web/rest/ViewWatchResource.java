package com.flair.bi.web.rest;

import com.flair.bi.domain.View;
import com.flair.bi.domain.viewwatch.ViewWatch;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.service.ViewWatchService;
import com.flair.bi.web.rest.util.PaginationUtil;
import com.querydsl.core.types.Predicate;
import io.swagger.annotations.ApiParam;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.querydsl.binding.QuerydslPredicate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URISyntaxException;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ViewWatchResource {

    private final ViewWatchService viewWatchService;

    @GetMapping("/viewWatches")
    public ResponseEntity<List<ViewWatch>> getViewWatches
        (@ApiParam Pageable pageable,
         @QuerydslPredicate(root = ViewWatch.class) Predicate predicate) throws URISyntaxException {
        Page<ViewWatch> page = viewWatchService.findAll(pageable, predicate);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/viewWatches");
        return ResponseEntity.status(200).headers(headers).body(page.getContent());
    }

    @PostMapping("/viewWatches")
    @ResponseStatus(HttpStatus.OK)
    public void saveViewWatch(@RequestBody View view) {
        viewWatchService.saveViewWatchAsync(SecurityUtils.getCurrentUserLogin(), view);
    }
}
