package com.flair.bi.web.rest.vm;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangePermissionVM {

    private String id;

    private Action action;

    public enum Action {
        ADD, REMOVE
    }
}
