package com.flair.bi.web.rest;

import com.flair.bi.domain.User;
import com.flair.bi.domain.View;
import com.flair.bi.domain.bookmarkwatch.BookmarkWatch;
import com.flair.bi.domain.viewwatch.ViewWatch;
import com.flair.bi.security.SecurityUtils;
import com.flair.bi.service.BookMarkWatchService;
import com.flair.bi.service.UserService;
import com.flair.bi.service.ViewWatchService;
import com.flair.bi.service.dto.ConfigurationDTO;
import com.flair.bi.service.dto.CountDTO;
import com.flair.bi.web.rest.util.PaginationUtil;
import com.querydsl.core.types.Predicate;
import io.swagger.annotations.ApiParam;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.querydsl.binding.QuerydslPredicate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URISyntaxException;
import java.util.List;

import javax.persistence.EntityNotFoundException;

@RestController
@RequestMapping("/api")
@Slf4j
@RequiredArgsConstructor
public class BookmarkWatchResource {

    private final BookMarkWatchService bookMarkWatchService;
    
    private final UserService userService;

    @GetMapping("/bookmark-watches")
    public ResponseEntity<List<BookmarkWatch>> getBookmarkWatchs
        (@ApiParam Pageable pageable,
         @QuerydslPredicate(root = BookmarkWatch.class) Predicate predicate) throws URISyntaxException {
        Page<BookmarkWatch> page = bookMarkWatchService.findAll(pageable, predicate);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/bookmark-watches");
        return ResponseEntity.status(200).headers(headers).body(page.getContent());
    }
    
    
    @GetMapping("/bookmark-watches/recently-created/count")
    public ResponseEntity<CountDTO> getCreatedBookmarkWatchsCount() throws URISyntaxException {
        String login = SecurityUtils.getCurrentUserLogin();
        final User user = userService.getUserWithAuthoritiesByLogin(login)
                .orElseThrow(() -> new EntityNotFoundException(String.format("User with login: %s was not found", login)));
        Integer count = bookMarkWatchService.getCreatedBookmarkCount(user.getId());
        return ResponseEntity.status(200).body(new CountDTO(Long.valueOf(count)));
    }
    
}
