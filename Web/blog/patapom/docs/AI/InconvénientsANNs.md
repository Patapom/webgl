
# L'architecture des réseaux de neurones actuels


Transformer en "inconvénients de NNs", dont l'archi fixe?

Autre inconvénient => Incapacité à généraliser et gérer OOD https://deoxyribose.github.io/No-Shortcuts-to-Knowledge/

Lien sur Word2Vec problème

End to End approach pour chaque problème plutôt que de se concentrer sur l'assemblage de petits morceaux (encore dans l'article https://deoxyribose.github.io/No-Shortcuts-to-Knowledge/ dans la partie "Representing knowledge as probabilistic programs")


Plein de dimensions dans l'espace latent permet de démêler plein de classes mais **PAS** de gérer les liens entre les classes => on ne peut pas rapprocher les clasess entre elles pour en calculer 
 le dot product pour mesurer leur similitude, ce qu'essaie de faire Word2Vec, car on cherche à comparer des features/properties/attributes de classes, et elles en ont souvent des dizaines !
 C'est un peu aussi vain que demander 1 classe d'objet qui se trouve dans une image là où il y a probablement des milliers de choses à sortir d'une image, déjà en nombre de sujets qui s'y trouvent
 mais également en terme de niveau de détail selon ce qu'on cherche à synthétiser (ex: une photo gigapixel du Louvre, ou tous les gens qui le visitent et qui sont sur la photo ? Un chien, ou bien ses pattes, ses oreilles, sa truffe et autres morceaux indviduels ?)



Ma principale critique vis-à-vis du ML et des réseaux de neurones artificiels est, pour l'instant, leur extrême rigidité : l'architecture du réseau est toujours figée, généralement designée (designed) par un humain
 qui va ensuite lancer l'optimisation du modèle afin de maximiser/minimiser une fonction d'objectif en le nourrissant de milliers, de millions voire de milliards de données (le dataset).
Chaque fois qu'on va vouloir modifier la structure du réseau, il va falloir lui faire réapprendre tout depuis le début.
Parfois on peut prendre un modèle entraîné et l'adapter à un nouveau dataset (fine tuning), en gros on part d'un point d'équilibre dans un optimum local (ou global!) pour reprendre l'entraînement sur un nouvel
 ensemble de données afin de rendre le modèle tolérant à de nouveaux exemples qu'il n'avait pas vus auparavant.

Cela reste malgré tout un processus extrêmement lourd, qui consomme énormément de données, de temps et d'énergie et qui se révèle très peu flexible. On constate de plus assez souvent une incapacité à s'adapter
 à de nouvelles situations non rencontrées durant l'apprentisasge (out of distribution data), et ces réseaux sont capables de tâches extrêmement réduites (on parle de narrow AI), même s'il on peut difficilement
 considérer la maîtrise du langage par certains modèles comme étant une tâche réduite.




>:warning: **TODO**

>(ML classique + incapacité d'apprendre)
