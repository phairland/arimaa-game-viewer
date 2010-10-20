
var default_board_position = "1g  Ra1 Db1 Rc1 Rd1 De1 Rf1 Rg1 Rh1 Ra2 Hb2 Cc2 Md2 Ee2 Cf2 Hg2 Rh2 1s   ra7 hb7 cc7 ed7 me7 df7 hg7 rh7 ra8 rb8 rc8 dd8 ce8 rf8 rg8 rh8";

var example_game =
// short 7 moves
//"1w Ra1 Db1 Rc1 Rd1 De1 Rf1 Rg1 Rh1 Ra2 Hb2 Cc2 Md2 Ee2 Cf2 Hg2 Rh2 1b ra7 hb7 cc7 ed7 me7 df7 hg7 rh7 ra8 rb8 rc8 dd8 ce8 rf8 rg8 rh8 2w Ee2n Ee3n Ee4n Hg2n 2b ed7s ed6s ed5s hg7s 3w De1n Ee5w Ed5n Hb2n 3b ed4s hb7s ra7e rh7w 4w Db1n Hb3n Hb4n Db2n 4b ed3n Md2n ed4w Md3n 5w Hb5w De2w Rc1w Rd1w 5b ec4n Md4w ec5w Mc4n 6w Ed6s Mc5s Ed5w Mc4e 6b eb5s eb4e Db3n me7w 7w Ec5e Md4s Ha5s Db4s";

//var example_game =  
//"1w Ra1 Rb1 Rc1 Rd1 Re1 Rf1 Rg1 Rh1 Da2 Hb2 Cc2 Ed2 Me2 Cf2 Hg2 Dh2 1b ha7 hb7 ec7 cd7 de7 rf7 mg7 dh7 ra8 rb8 cc8 rd8 re8 rf8 rg8 rh8 2w Ed2n Ed3n Hb2n Me2n 2b hb7s ec7s ec6s ec5s 3w Cf2n Hg2w Da2e Cf3e 3b ec4w eb4e Hb3n cc8s 4w Ed4n Ed5w Db2n Dh2w 4b ha7s ha6s ec4e ed4s 5w Ec5s Hb4w Re1n Me3e 5b ed3s ed2n Rd1n mg7s 6w Ec4e Db3s Ha4e Hb4s 6b ed3e Rd2n ee3n Re2n 7w Dg2e Hf2e Mf3s Re3e 7b ee4e ef4e Rf3n dh7s 8w Ed4e Ee4n Ee5e Cc2e 8b Rf4w eg4w Re4n ef4w 9w Re5n Ef5e Eg5w mg6s 9b dh6s mg5n Re6e de7s 10w Cg3w Hg2n Hg3n Cf3e 10b dh5n ee4w ed4w Rd3n 11w Db2e Hg4e Hh4n Rb1n 11b Rd4n ec4e dh6n cd7s 12w Ef5e Rf6x Hh5n Eg5w mg6s 12b ed4e ee4e ef4e mg5n 13w Ef5e Eg5w mg6s Hh6w 13b Hg6n mg5n dh7s eg4w 14w Ef5w de6e Ee5n Dh2w 14b ef4w ee4n rf7w df6n 15w Hb3n Hb4n Hb5e Cd2n 15b Rd5s ee5w Hc5n Hc6x ed5w 16w Mf2n Mf3n Mf4n Rd4n 16b ec5s ec4e ed4e ee4e 17w Ee6e mg6s Ef6e Rf1n 17b cd6e Rd5n rd8s cc7s 18w mg5e Eg6s Eg5s Hg7s 18b cc6n Rd6w Rc6x Mf5w ef4n 19w Eg4w Ef4w ce6e Me5n 19b mh5w Hg6n mg5n ef5w 20w Ee4w Ed4n Ed5n Rb2n 20b cf6s Me6e Mf6x ee5n re8w 21w Dc2n Dc3n Dc4n Rc1n 21b mg6s Hg7s rg8s ha5e 22w Ed6w hb6n Ec6w Ra1n 22b Hg6w Hf6x mg5n ee6w mg6s 23w Ra2n Ra3n Rb3n Ra4n 23b df7s df6w ed6s de6w 24w Eb6w hb7s hb6e Ea6e 24b cc7w hc6n Dc5n ed5w 25w Rc2w Rb2n Rb4w Ra5n 25b hb5s hb4n Rb3n ra8s 26w Rb4e hb5s Eb6s Dc6x Rf2w 26b ec5e ed5s Rc4n ed4w 27w Re2w Rd2w Eb5n 27b Rc5n ec4n mg5s re7s 28w Eb6s Rc6x cb7s hb4s Eb5s 28b ec5s Cg3w Cf3x mg4s cf5s 29w Eb4n Eb5s cb6s Ra4n 29b mg3w Dg2n mf3w Dg3w Df3x 30w cb5e Eb4n Eb5n Eb6n 30b dd6w dc6w re6s re5s 31w hc7s Eb7e Ec7w Rg1w 31b me3e re4s re3s re2s 32w";

"1w Ra1 Db1 Rc1 Rd1 De1 Rf1 Rg1 Rh1 Ra2 Hb2 Cc2 Md2 Ee2 Cf2 Hg2 Rh2 1b ra7 hb7 cc7 ed7 me7 df7 hg7 rh7 ra8 rb8 rc8 dd8 ce8 rf8 rg8 rh8 2w Ee2n Ee3n Ee4n Hg2n 2b ed7s ed6s ed5s hg7s 3w De1n Ee5w Ed5n Hb2n 3b ed4s hb7s ra7e rh7w 4w Db1n Hb3n Hb4n Db2n 4b ed3n Md2n ed4w Md3n 5w Hb5w De2w Rc1w Rd1w 5b ec4n Md4w ec5w Mc4n 6w Ed6s Mc5s Ed5w Mc4e 6b eb5s eb4e Db3n me7w 7w Ec5e Md4s Ha5s Db4s 7b ec4e Md3e ed4s ce8s 8w Dd2e Me3n Me4w Md4w 8b ed3n Mc4n ed4w ec4w 9w Mc5s Ed5w Mc4s Ec5w 9b eb4e ec4w Mc3n md7s 10w Eb5e Mc4s Mc3e Ec5w 10b eb4e Ha4e ec4e Hb4e 11w Eb5e Hc4s Md3s Ec5w 11b hg6e hh6s hh5s hh4s 12w hb6w Eb5n Eb6s rb7s 12b hh3n Rh2n hh4n Rh3n 13w Eb5e rb6s rb5s Ec5w 13b hh5n Rh4n ed4w rb4w 14w Eb5e Ec5e Ed5e md6s 14b ec4e Hc3n md5w hh6w 15w Db3e Hc4w Hb4s ra4e 15b ed4w ec4e Dc3n ha6s 16w Md2n Hb3s rb4s Ee5w 16b Md3s ed4s ha5e dd8s 17w rb3e Hb2n Ed5n mc5e 17b hb5e md5s Dc4w md4w 18w Ra2e Ed6s Db4w Da4s 18b hc5w hb5w ha5s mc4w 19w Ed5w De2s Md2e Me2n 19b ha4n Da3n Hb3w mb4s 20w Ec5w Ra1n De1n De2w 20b mb3n rc3w mb4e mc4s 21w Da4e Db4e Eb5e Cf2w 21b hg6e hh6w Rh5n rh8s 22w Me3e Mf3n Mf4e Mg4n 22b hg6w Rh6w hf6w Rg6w Rf6x 23w Mg5w Hg3n Hg4n Hg5n 23b ed3e ee3n ee4e mc3e 24w Ec5e Ed5s Hg6s Mf5w 24b ef4n ha5e hb5s rg7s 25w Ha3n rb3w md3w mc3x Ed4s 25b ef5s Me5e Mf5n Mf6x ef4n 26w Ed3n Dc4s Dc3w Ed4w 26b ef5w Hg5w Hf5n Hf6x ee5e 27w Ec4e hb4e hc4s hc3x Ed4w 27b ef5w ee5s ee4s he6w 28w Ce2e Cf2e Db3n ra3e 28b ee3w df7s df6s df5e 29w rb3e Db4s Ec4e Dd2e 29b dg5s dg4s Cg2w dg3s 30w De2n Cf2n Rf1n Cf3e 30b hd6w hc6w hb6s rb8s 31w Ha4e Hb4e Hc4n Hc5e 31b hb5s Db3w hb4s rf8s 32w Hd5e He5e Hf5s Hf4s 32b ed3s rc3e Cc2n Cc3x ed2w 33w Ed4w rd3n Rf2w Hf3s 33b ec2e ed2n dd7s dd6s 34w Rb2e Ec4s hb3s Ec3w 34b dd5w dc5s rb7s rb6s 35w De3n rd4n De4w Re2w 35b ed3e ee3s Hf2s ee2e 36w Rd2n Rd3e Rc2e Rd2n 36b Cg3e dg2n rg6s rg5s 37w Dd4e De4e Rd3n Rc1n 37b ef2n Df4n ef3n dc4n 38w Hf1n Hf2n dg3s Hf3e 38b Df5n Df6x ef4n ef5s rg4e 39w Eb3e hb2n Ec3n hb3e hc3x 39b ef4e eg4w Hg3n dg2n 40w Ec4s dc5s Ec3e dc4s dc3x 40b ef4s ef3n Re3e Rf3x ce7s 41w Ed3e Da3n Da4n Da5n 41b rf7s rf6s rd5e ce6w 42w Da6e Ra2n Ra3n Ra4n 42b rc8w Hg4n ef4e rf5s 43w Ee3n rf4n Ee4e Rg1w 43b re5s cd6s cd5e re4s 44w Ef4w re3w Ee4s Rf1n 44b rf5s dg3s Ch3w rh4s 45w rd3w rc3x Ee3w Ed3e Ra5n 45b eg4e rh3s 46w";

// fan test
//'1g Ra1 Db1 Rc1 Rd1 De1 Rf1 Rg1 Rh1 Ra2 Hb2 Cc2 Md2 Ee2 Cf2 Hg2 Rh2 1s   ra7 hb7 cc7 ed7 me7 df7 hg7 rh7 ra8 rb8 rc8 dd8 ce8 rf8 rg8 rh8 2g   Ee2n Ee3n Ee4n Hg2n 2s   ed7s ed6s ed5s hg7s 3g   De1n Ee5w Ed5n Hb2n [ 3g ea3s db4w ch4e hg4n ]  3s   ed4s hb7s ra7e rh7w 4g "this is good position"  Db1n Hb3n Hb4n Db2n 4s   ed3n Md2n ed4w Md3n "very good move" 5g Hb5w De2w Rc1w Rd1w [ 5g ha5n hb4s hd4w hf4e ] 5s ec4n Md4w ec5w Mc4n 6g Ed6s Mc5s Ed5w Mc4e 6s eb5s eb4e Db3n me7w 7g Ec5e Md4s Ha5s Db4s';
//'1g Ra1 Db1 Rc1 Rd1 De1 Rf1 Rg1 Rh1 Ra2 Hb2 Cc2 Md2 Ee2 Cf2 Hg2 Rh2 1s   ra7 hb7 cc7 ed7 me7 df7 hg7 rh7 ra8 rb8 rc8 dd8 ce8 rf8 rg8 rh8 2g Ee2n';

/*

1g Ra1 Db1 Rc1 Rd1 De1 Rf1 Rg1 Rh1 Ra2 Hb2 Cc2 Md2 Ee2 Cf2 Hg2 Rh2
1s ra7 hb7 cc7 ed7 me7 df7 hg7 rh7 ra8 rb8 rc8 dd8 ce8 rf8 rg8 rh8 
2g Ee2n Ee3n Ee4n Hg2n 
2s ed7s ed6s ed5s hg7s 
3g De1n Ee5w Ed5n Hb2n 
 [ 3g ea3s db4w ch4e hg4n ] 
3s   ed4s hb7s ra7e rh7w
4g "this is good position" Db1n Hb3n Hb4n Db2n 
4s   ed3n Md2n ed4w Md3n "very good move" 
5g Hb5w De2w Rc1w Rd1w 
 [ 5g ha5n hb4s hd4w hf4e ] 
 5s ec4n Md4w ec5w Mc4n 
 6g Ed6s Mc5s Ed5w Mc4e 
 6s eb5s eb4e Db3n me7w 
 7g Ec5e Md4s Ha5s Db4s'

*/
