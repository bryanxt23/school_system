package com.payroll.backend.books;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Collection;
import java.util.List;

public interface RequiredBookRepository extends JpaRepository<RequiredBook, Long> {
    List<RequiredBook> findAllByOrderByIdDesc();
    List<RequiredBook> findBySubjectIdOrderByIdDesc(Long subjectId);
    List<RequiredBook> findBySchoolYearIdOrderByIdDesc(Long schoolYearId);
    List<RequiredBook> findBySubjectIdInAndSchoolYearId(Collection<Long> subjectIds, Long schoolYearId);
}
