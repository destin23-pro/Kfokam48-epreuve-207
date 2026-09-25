package com.kfokam.epreuve207.service;

import com.kfokam.epreuve207.dto.UserDTO;
import com.kfokam.epreuve207.model.Role;
import com.kfokam.epreuve207.model.User;
import com.kfokam.epreuve207.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserDTO.Response createUser(UserDTO.CreateRequest request) {
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(request.getPassword()) // En production: encoder le mot de passe
                .role(request.getRole() != null ? request.getRole() : Role.ROLE_USER)
                .build();

        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    public List<UserDTO.Response> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public UserDTO.Response getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec ID: " + id));
        return mapToResponse(user);
    }

    public UserDTO.Response mapToResponse(User user) {
        return UserDTO.Response.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }
}
