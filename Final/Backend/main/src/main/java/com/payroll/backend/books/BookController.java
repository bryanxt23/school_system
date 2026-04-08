package com.payroll.backend.books;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookRepository repo;

    public BookController(BookRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Book> list() { return repo.findAllByOrderByTitleAsc(); }

    @PostMapping
    public Book create(@RequestBody Book body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        if (body.getTitle() == null || body.getTitle().isBlank())
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title required");
        return repo.save(body);
    }

    @PutMapping("/{id}")
    public Book update(@PathVariable Long id, @RequestBody Book body, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        Book b = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (body.getTitle() != null) b.setTitle(body.getTitle());
        b.setAuthor(body.getAuthor());
        b.setIsbn(body.getIsbn());
        b.setPrice(body.getPrice());
        b.setCoverUrl(body.getCoverUrl());
        return repo.save(b);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpServletRequest req) {
        AdminGuard.requireAdmin(req);
        repo.deleteById(id);
    }
}
