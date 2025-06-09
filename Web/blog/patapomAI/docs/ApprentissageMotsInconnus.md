# Les phonèmes de mots inconnus

2nd Prototype d'apprentissage non-supervisé ==> apprendre les phonèmes de mots inconnus.

![](images/TODO.png)

L'idée ici est de trouver la forme phonétique pour une forme orthographique donnée.

C'est assez compliqué car pour chaque combinaison de lettres, on va avoir un choix à faire sur les phonèmes à employer et ce choix va varier en fonction du contexte : typiquement la ou les lettres qui précèdent ou suivent le groupe de lettres courant (par exemple, on va utiliser [ə] ou [œ] pour "app **e** ler" mais [ɛ] pour "app **e** lle" car il y a 2 'l')



## **TODO**

* Penser à appliquer sur les liaisons entre les mots.
    * Lister les mots composés et trouver ceux dont la phonétique est différentes des mots pris individuellement
    * Une fois qu'on aura un truc qui fait du speech to text, on pourra s'en servir pour analyser la diction des phrases communes...



[^1]: 2024, Kirsanov A., ["How your brain chooses to remember"](https://www.youtube.com/watch?v=ceFFEmkxTLg&ab_channel=ArtemKirsanov)
[^2]: 2024, Yang W. et al. ["Selection of experience for memory by hippocampal sharp wave ripples"](https://www.science.org/doi/10.1126/science.adk8261) ([site](https://winnieyangwannan.github.io/RippleTagging/projects/1_project/)) ([notebook](https://colab.research.google.com/drive/1qwruNxqS20xIl7sXYwjUA5zXKLTMWuTz?usp=drive_link))
[^3]: 2011, Tenenbaum J. ["How to Grow a Mind: Statistics, Structure, and Abstraction"](https://cocosci.princeton.edu/tom/papers/LabPublications/GrowMind.pdf)

