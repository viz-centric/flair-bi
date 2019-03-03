package com.flair.bi.web.rest.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ReleaseRequestDTO {

    private Long id;

    private UserDTO requestedBy;

    private DashboardReleaseDTO release;

    private String comment;


    @Data
    public static class UserDTO {
        private String login;
    }

    @Data
    public static class DashboardReleaseDTO {

        private Long versionNumber;

        private DashboardDTO dashboard;

        private List<ViewReleaseDTO> viewReleases = new ArrayList<>();

    }

    @Data
    public static class DashboardDTO {

        private Long id;

        private String dashboardName;
    }

    @Data
    public static class ViewReleaseDTO {

        private ViewDTO view;

        private Long versionNumber;

    }

    @Data
    public static class ViewDTO {
        private Long id;
        private String viewName;
    }
}
