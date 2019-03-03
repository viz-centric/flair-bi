package com.flair.bi.service.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Class that holds which entity will be deleted
 */
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class DeleteInfo {

    private String type;

    private String name;


}
