
-- aziende
CREATE TABLE `aziende` (
  `id_azienda` int(11) NOT NULL,
  `nome` varchar(50) NOT NULL,
  `alias` varchar(100) DEFAULT NULL,
  `partita_iva` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `pec` varchar(50) NOT NULL,
  `indirizzo` varchar(100) DEFAULT NULL,
  `data_add` datetime DEFAULT NULL,
  `data_upd` datetime DEFAULT NULL,
  `codice` char(15) NOT NULL,
  `attivo` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `aziende`
  ADD PRIMARY KEY (`id_azienda`),
  ADD UNIQUE KEY `nome_UNIQUE` (`nome`);

ALTER TABLE `aziende`
  MODIFY `id_azienda` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

-- profilo
CREATE TABLE `profili` (
  `id_profilo` int(11) NOT NULL,
  `nome` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `profili` (`id_profilo`, `nome`) VALUES
(1, 'superadmin'),
(2, 'admin'),
(3, 'user'),
(4, 'simpleuser');

ALTER TABLE `profili`
  ADD PRIMARY KEY (`id_profilo`);

-- utenti
CREATE TABLE `utenti` (
  `id_utente` int(11) NOT NULL,
  `email` varchar(128) NOT NULL,
  `password` varchar(255) NOT NULL,
  `data_add` datetime DEFAULT NULL,
  `data_upd` datetime DEFAULT NULL,
  `id_profilo` int(11) NOT NULL,
  `nome` varchar(50) DEFAULT NULL,
  `attivo` tinyint(1) NOT NULL DEFAULT '1',
  `num_db` int(11) NOT NULL DEFAULT '0',
  `passwd_cambiata` tinyint(1) NOT NULL DEFAULT '0',
  `token` varchar(550) NOT NULL,
  `data_token` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


ALTER TABLE `utenti`
  ADD PRIMARY KEY (`id_utente`),
  ADD KEY `FK_utenti_1_idx` (`id_profilo`);

ALTER TABLE `utenti`
  MODIFY `id_utente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

ALTER TABLE `utenti`
  ADD CONSTRAINT `FK_utenti_1` FOREIGN KEY (`id_profilo`) REFERENCES `profili` (`id_profilo`);

-- associazioni
CREATE TABLE `associazioni` (
  `id_associazione` int(11) NOT NULL,
  `id_azienda` int(11) NOT NULL,
  `id_utente` int(11) NOT NULL,
  `data_scadenza` date DEFAULT NULL,
  `data_add` datetime DEFAULT NULL,
  `data_upd` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


ALTER TABLE `associazioni`
  ADD PRIMARY KEY (`id_associazione`),
  ADD UNIQUE KEY `id_azienda_UNIQUE` (`id_azienda`,`id_utente`),
  ADD KEY `fk_aziende_has_utenti_utenti1_idx` (`id_utente`),
  ADD KEY `fk_aziende_has_utenti_aziende1_idx` (`id_azienda`);


ALTER TABLE `associazioni`
  MODIFY `id_associazione` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;


ALTER TABLE `associazioni`
  ADD CONSTRAINT `fk_aziende_has_utenti_aziende1` FOREIGN KEY (`id_azienda`) REFERENCES `aziende` (`id_azienda`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_aziende_has_utenti_utenti1` FOREIGN KEY (`id_utente`) REFERENCES `utenti` (`id_utente`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- documents
CREATE TABLE `documents` (
  `id_document` INT NOT NULL AUTO_INCREMENT ,
  `id_azienda` INT NOT NULL ,
  `tipo` VARCHAR(255) NOT NULL ,
  `data_add` DATE NULL ,
  `data_update` DATE NULL ,
  `documento_1` VARCHAR(255) NOT NULL ,
  `documento_2` VARCHAR(255) NOT NULL ,
  `stato` INT NOT NULL DEFAULT '0' ,
  `note` VARCHAR(5000) NOT NULL ,
  PRIMARY KEY (`id_document`)) ENGINE = InnoDB;

ALTER TABLE `documents`
  ADD PRIMARY KEY (`id_document`),
  ADD KEY `fk_aziende_idx` (`id_azienda`);

ALTER TABLE `documents` ADD INDEX( `id_azienda`);
ALTER TABLE `documents` ADD CONSTRAINT `fk_aziende` FOREIGN KEY (`id_azienda`) REFERENCES `credit-key`.`aziende`(`id_azienda`) ON DELETE RESTRICT ON UPDATE RESTRICT;