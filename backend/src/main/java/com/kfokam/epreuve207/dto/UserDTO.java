package com.kfokam.epreuve207.dto;

import com.kfokam.epreuve207.model.Role;
import lombok.Builder;
import lombok.Data;

public class UserDTO {

    @Data
    public static class CreateRequest {
        private String username;
        private String email;
        private String password;
        private Role role;
    }

    @Data
    @Builder
    public static class Response {
        private Long id;
        private String username;
        private String email;
        private Role role;
    }
}
