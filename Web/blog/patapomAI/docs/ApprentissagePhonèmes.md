# Les phonèmes de la langue française

![](images/WorkInProgress.png)

Les phonèmes de la langue française sont au nombre de 36[^1] :

**Voyelles**

[i] : <b>i</b>l ; [e] : bl<b>é</b> ; [ɛ] : col<b>è</b>re ; [a] : pl<b>a</b>tte ; [ɑ] : p<b>â</b>te ; [ɔ] : m<b>o</b>rt ; [o] : ch<b>au</b>d ; [u] : gen<b>ou</b>  [y] : r<b>u</b>e ; [ø] : p<b>eu</b> ; [œ] : p<b>eu</b>r ; [ə] : l<b>e</b> ; [ɛ̃] : pl<b>ein</b> ; [ɑ̃] : s<b>an</b>s ; [ɔ̃] : b<b>on</b> ; [œ̃] : br<b>un</b>.

**Semi-consonnes**

[j] : <b>y</b>eux ; [w] : <b>ou</b>i ; [ɥ] : l<b>u</b>i.

**Consonnes**

[p] : <b>p</b>ère ; [t] : <b>t</b>erre ; [k] : <b>c</b>ou ; [b] : <b>b</b>on ; [d] : <b>d</b>ans ; [ɡ] : <b>g</b>are ; [f] : <b>f</b>eu ; [s] : <b>s</b>ale ; [ʃ] : <b>ch</b>at ; [v] : <b>v</b>ous ; [z] : <b>z</b>éro ; [ʒ] : <b>j</b>e ; [l] : <b>l</b>ent ; [ʁ] : <b>r</b>ue ; [m] : <b>m</b>ain ; [n] : <b>n</b>ous ; [ɲ] : a<b>gn</b>eau.

**Consonnes parfois ajoutées mais relevant d'emprunts aux langues étrangères**

[h] : <b>h</b>op ; [ŋ] : campi<b>ng</b> ; [x] : jota espagnole, c'h breton et '*kh*, plutôt prononcés [χ] d'ailleurs.



## Problème

On dispose d'un ensemble de 50000 mots français et leur représentation phonétique, par exemple "agneau" [aɲo].

On cherche à apprendre de manière automatisée quels groupes de lettres correspondent à quels groupes de phonèmes, par exemple "a" = [a], "gn" = [ɲ], "eau" = [o].



Comme pour chaque problème, on essaie (1) de se placer dans un état où l'on ignorerait tout du résultat, (2) d'imaginer comment nous nous attaquerions à la résolution de ce problème et (3) comment on pourrait reproduire cet algorithme de résolution artificiellement.

### Intuition

Prenons quelques exemples de mots au hasard :

"adverbial" [advɛʀbjal]
"colimaçon" [kɔlimasɔ̃]
"khan" [kɑ̃]
"lexicographie" [lɛksikɔgʀafi]
"mangue" [mɑ̃g]
"neuronale" [nøʀɔnal]
"organisationnel" [ɔʀganizasjɔnɛl]
"ouatée" ['wate]
"pécore" [pekɔʀ]
"polygénique" [pɔliʒenik]
"quérulente" [keʀylɑ̃t]
"radiogalaxie" [ʀadjogalaksi]
"résistante" [ʀezistɑ̃t]
"sarcophage" [saʀkɔfaʒ]
"sordidité" [sɔʀdidite]
"tamponnement" [tɑ̃pɔnmɑ̃]
"trépanation" [tʀepanasjɔ̃]
"vampiriser" [vɑ̃piʀize]

On voit qu'on essaie de *mapper* 2 séquences ensemble :

* On sait qu'il y a autant de groupes de lettres que de groupes de phonèmes : c'est un mapping 1-1
* Il y a un ordre à respecter : le groupe de lettres doit avoir le même index que le groupe de phonèmes correspondant, on peut pas intervertir l'ordre, par exemple le 2nd groupe de lettres qui serait attaché au 3ème groupe de phonèmes
* Les seules **certitudes** qu'on ait sur la position des groupes c'est que la 1ère lettre et le 1er phonème vont ensemble, ainsi que la dernière lettre et le dernier phonème.
* Mais on peut utiliser une heuristique simple qui consiste à dire qu'une lettre à une position $l \in [1,L]$ donnée va probablement correspondre à un phonème à la position $p \in [1,P]$ où $p \approx l \cdot \frac{P}{L}$ : une lettre au milieu du mot va probablement correspondre à un phonème au milieu aussi.



Intuitivement, on va essayer de trouver des correspondances



### Notion de certitude

**TODO**

* Notion de certitude et étaiement de la "confiance"
    * La certitude est une notion contextuelle, elle dépend de son environnement
* Définition de la notion de "avoir du sens" (on sent que quelque chose "clique" et s'emboîte parfaitement dans notre raisonnement : on a *compris* !)
    * ==> on s'arrête quand on a "fait du sens" (état stable)





## Notes

Différence entre phonétique et phonologie : https://fr.wikipedia.org/wiki/Phonologie
Apparemment, la phonologie ne fait pas la distinction entre les sons trop proches, genre bien, brun, etc.




[^1]: ["Les phonèmes du français"](https://fr.wikipedia.org/wiki/Phon%C3%A8me)
