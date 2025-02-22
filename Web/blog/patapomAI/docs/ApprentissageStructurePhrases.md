# La structure des phrases de la langue française

4ème Prototype d'apprentissage non-supervisé => C'est probablement le plus important car on ne traite plus seulement de séquences mais de structures hiérarchiques, de patterns, etc.

![](images/TODO.png)



# Réflexions

* Possibilités d'inflexion de certaines expressions : on peut obéir aux règles standard (par ex. rajouter des adjectifs ou des adverbes), ou bien paraphraser des expressions (par ex. pour l'humour), ou bien l'expression n'est valable QUE dans sa forme pure et inaltérée (cas typique des proverbes)
    * Mais même des expressions pures doivent porter du sens, qu'on peut paraphraser (pour l'humour).
        * "Pierre qui roule n'amasse pas mousse"
            * Sens : Changer souvent d'habitudes ou de lieu ne permet pas de créer des liens forts (amitié, amour, famille)
            * "Caillou mouvant ne forme pas de lychen" <== C'est très con mais c'est "marrant"
* 



# Papier [^1]

Fiche : [fiche://7eb647e7-955b-48f4-9a89-06370ca88fb1/](fiche://7eb647e7-955b-48f4-9a89-06370ca88fb1/)

Ce papier de NLP essaye de pousser à utiliser des **constructions** plutôt que des règles rigides. C'est exactement ce que j'avais en tête quand je parlais de [**filtres et de procédures à trous**](LeçonsLLM.md#brouillon) sauf qu'eux appellent les "trous" des **slots**.

L'idée est donc de construire des centaines de milliers (!!) de **constructions** qu'on va pouvoir appliquer selon les situations et le contexte... C'est évidemment beaucoup plus flexible que les modèles de grammaires basées sur des règles strictes (Chomsky) et se prête naturellement à la nature fluide du langage.

Les slots des constructions vont pouvoir être remplis à leur tour par d'autres constructions, menant ainsi à une structure hiérarchique décrivant la phrase. Les grammaires classiques peuvent être bien entendu complètement englobées par ces structures beaucoup plus génériques et flexibles.

**Note: ** Beaucoup de ces constructions peuvent sans doute être apprises statistiquement mais certaines, rares, devront probablement être corrigées par un *tuteur de confiance* (apprentissage supervisé). Par exemple on indiquera qu'on ne peut utiliser que certains types de mots, ou que c'est à n'utiliser que dans un contexte humoristique, etc.



Table 2: Example constructions at varying levels of complexity and abstraction

| **Types of Construction**                             | **Examples**                                                 |
| ----------------------------------------------------- | ------------------------------------------------------------ |
| **Words**                                             | pregame; running; nevertheless; ago                          |
| **Partially filled words (morphemes)**                | pre-Noun~event~; Verb-ing                                    |
| **Collocations, fixed idioms**                        | high winds; jump the shark                                   |
| **Partially-filled productive constructions**         | X is the new Y; It’s Adjective &lt;agent&gt; of  VP~to~      |
| **Partially-filled argument structure constructions** | give &lt;recipient> a call                                   |
| **Argument structure constructions**                  | Intransitive; Caused-motion; Double Object; Resultative      |
| **Discourse-structuring constructions**               | get-passive; information questions; it-clefts; relative clauses |





## Citations du paragraphe 5 :

> :bulb: **Sur les attributs qu'on associe généralement aux mots en NLP classique :**  
>
> Formal attributes may include phonology, lexical content, grammatical categories, word order, discontinuous elements, and/or intonation.



> :bulb: **Sur la similitude des constructions**  
>
> Constructions are also influenced by similarity: Instances of a construction prime instances of the same or closely related construction



> :bulb: **Sur le côté imbriqué de la syntaxe, de la morphologie et de la sémantique (pas de barrière aussi tranchée que les catégories qu'on a pu définir)**  
>
> As shown in Table 2, syntax, semantics and morphology are interrelated rather than assigned to distinct levels. This is useful because even productive hierarchical constructions often include particular words and semantic constraints. For example, an English construction that implies real or metaphorical motion allows a wide range of verbs but requires the particular noun ‘way’ ( ’He charmed his way into the meeting’.)



> :bulb: **Plentiful and Context-Sensitive**  
>
> The broad definition of constructions as pairings of form and function, including words and grammatical patterns, is another difference between constructions and rules. Constructions are far richer and more plentiful than the class of rules is commonly envisioned to be. Constructions also do far more work than rules since they capture frequency information and contextual constraints, while rules are presumed to be context-free and uninfluenced by frequency.



> :bulb: **Interrelated System, Not Unstructured List**  
>
> Unlike rules, which are commonly presented as unstructured lists, constructions comprise a network of interrelated statistical patterns. This allows for the fact that languages have families of related constructions. It also allows for the simple fact that productive constructions simultaneously co-exist with specific conventional instances. For instance, the English ‘double object’ construction is productive, and speakers are also familiar with dozens of conventional instances (e.g., ‘give  the time of day’, ‘throw  a bone’).



> :bulb: **Construction Slots Are Constrained**  
>
> The open ‘slots’ of constructions are constrained in a wide variety of ways. For instance, the English doubleobject construction can appear with a wide range of verbs, but prefers simple verbs to those that sound Latinate (e.g., ’She told them something’ vs. ’She proclaimed them something’).  
>
> The English comparative suffix ‘-er’ (e.g., ‘calmer’, ‘quicker’) is available for most single-syllable adjectives that allow a gradient interpretation, but it is not used with past participles adjectives (? ‘benter’).



> :bulb: **An Example**  
>
> Consider ‘X is the new Y’. It is productive and can be used to create new utterances e.g., ‘Semiconductor chips are the new oil.’ As is typical of productive constructions, the generalization co-exists with several familiar instances (e.g., ‘50 is the new 40’; ‘Orange is the new black’).  
>
> The construction is not an algebraic rule. Its slots, indicated by X and Y, are not variables that range freely over fixed syntactic categories. Instead, ‘X’ must be construed (playfully) as currently functioning in the culture as ‘Y’ used to. Therefore not all combinations of slot fillers make sense: (e.g., ? ‘Orange is the new oil’).  
>
> Adding a parallelism constraint between X and Y is insufficient since ‘103 is the new 101’ also makes little sense. Finally, instances of the construction are not amenable to translations into formal logic, which would presumably treat ‘Orange is the new black’ as equivalent to ‘Black is the old orange,’ which does not conventionally evoke the same meaning.



> :bulb: **Reversal Curse**  
>
> LMs have been found unreliable at drawing the following inference, which the authors dubbed the reversal curse: “if ‘A is B’ [...] is true, then ‘B is A’ follows by the symmetry property of the identity relation"  
>
> For example, ‘A mental illness is the same as a physical illness’ means something very different than ‘A physical illness is the same as a mental illness’  
>
> For instance, ‘night & day’ and ‘day & night’ are both acceptable, but their interpretations differ: the former conveys a stark contrast (e.g., ‘as different as night and day’), the latter suggests a relentless activity or process (e.g., ‘he worried day and night’).

  

> :bulb: **Natural Language utterances are not symmetric**  
>
> In summary, it is perhaps reasonable to expect truly symmetric knowledge to be reversible. But LMs are trained on natural language and natural language utterances are not symmetric. Human reasoning depends on the context in which performance is tested and how instructions are formulated.  
>
> Lampinen et al. (2024) find that LMs and humans are influenced by semantic context in similar ways.  
>
> Even math is not fully rule-compositional when equations are intended for communication: for instance, 2 + 2 = 4 means something different than 4 = 2 + 2, a preference picked up on by LMs.



## Citations du paragraphe 7 :

> :bulb: **Balancing Constructions and Rules**  
>
> Coding languages are compositional by design. They are unambiguous with variables filled by any instance of a clearly defined and general type.  
>
> Accordingly, increasing the proportion of code in pretraining improves performance on tasks that rely on rulebased compositionality such as logic and math. Yet Petty et al. (2024) report that adding code to pretraining data hurts performance on naturalistic language processing including tasks involving the English passive (...).  
>
> Sprague et al. (2024) report that while Chain-of-Thought prompting had been believed helpful across-the-board, performance only improves on problems that require algorithmic reasoning. Thus, adding code to pre-training or using CoT prompts benefit tasks that are designed to be rule-compositional but may be detrimental to to natural language tasks.



> :bulb: **Limitations des LMs** 
>
> However, Zhou et al. (2024) found LMs failed to distinguish entailment differences between the causal excess construction (e.g., ‘so heavy that it fell’) and two structurally similar constructions (‘so happy that she won’; ‘so certain that it rained’).  
>
> Similarly addressing challenging construction semantics, Weissweiler et al. (2024) showed LMs to struggle with the meaning of the caused-motion construction.




[^1]: https://arxiv.org/pdf/2502.13195