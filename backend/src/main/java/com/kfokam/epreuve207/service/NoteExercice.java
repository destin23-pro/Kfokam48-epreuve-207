package com.kfokam.epreuve207.service;

import java.util.List;

/**
 * Note d'un exercice relu par deux pairs (issue #25).
 * RG14 : la note est la moyenne des notes rendues, arrondie au dixième.
 * RG15 : tant qu'une seule des deux relectures est rendue, la note est provisoire.
 */
public record NoteExercice(Double note, boolean provisoire, int relecturesRendues) {

    public static final int RELECTEURS_PAR_EXERCICE = 2;

    public static NoteExercice calculer(List<Integer> notesRendues) {
        int rendues = notesRendues.size();
        if (rendues == 0) {
            return new NoteExercice(null, false, 0);
        }
        double moyenne = notesRendues.stream().mapToInt(Integer::intValue).average().orElseThrow();
        return new NoteExercice(Math.round(moyenne * 10.0) / 10.0, rendues < RELECTEURS_PAR_EXERCICE, rendues);
    }
}
