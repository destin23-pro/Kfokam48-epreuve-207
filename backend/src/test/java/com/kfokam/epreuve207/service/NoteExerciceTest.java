package com.kfokam.epreuve207.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/** Issue #25 : deux relecteurs par exercice, note = moyenne, provisoire si un seul a rendu. */
class NoteExerciceTest {

    @Test
    @DisplayName("RG14 : deux relectures rendues (12 et 15) donnent 13.5, note définitive")
    void deuxRelecturesRendues() {
        NoteExercice note = NoteExercice.calculer(List.of(12, 15));
        assertThat(note.note()).isEqualTo(13.5);
        assertThat(note.provisoire()).isFalse();
        assertThat(note.relecturesRendues()).isEqualTo(2);
    }

    @Test
    @DisplayName("RG15 : une seule relecture rendue donne sa note, marquée provisoire")
    void uneSeuleRelectureRendue() {
        NoteExercice note = NoteExercice.calculer(List.of(14));
        assertThat(note.note()).isEqualTo(14.0);
        assertThat(note.provisoire()).isTrue();
    }

    @Test
    @DisplayName("RG14 : aucune relecture rendue, pas de note (null et non 0)")
    void aucuneRelectureRendue() {
        NoteExercice note = NoteExercice.calculer(List.of());
        assertThat(note.note()).isNull();
        assertThat(note.provisoire()).isFalse();
    }

    @Test
    @DisplayName("RG14 : la moyenne est arrondie au dixième (7 et 8 donnent 7.5 ; 0 et 20 donnent 10)")
    void arrondi() {
        assertThat(NoteExercice.calculer(List.of(7, 8)).note()).isEqualTo(7.5);
        assertThat(NoteExercice.calculer(List.of(0, 20)).note()).isEqualTo(10.0);
    }
}
