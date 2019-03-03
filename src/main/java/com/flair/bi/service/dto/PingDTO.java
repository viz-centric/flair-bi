package com.flair.bi.service.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Response containing availability of certain url
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public final class PingDTO {

    private String url;

    private boolean available;
}
