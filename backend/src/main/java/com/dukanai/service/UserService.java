package com.dukanai.service;

import com.dukanai.entity.User;
import com.dukanai.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public User updateUser(Long id, User updates) {
        return userRepository.findById(id).map(user -> {
            if (updates.getName() != null) user.setName(updates.getName());
            if (updates.getShopName() != null) user.setShopName(updates.getShopName());
            if (updates.getPhone() != null) user.setPhone(updates.getPhone());
            if (updates.getPreferredLanguage() != null) user.setPreferredLanguage(updates.getPreferredLanguage());
            return userRepository.save(user);
        }).orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
    }
}
