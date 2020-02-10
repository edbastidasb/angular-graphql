import { element } from 'protractor';
import { Component, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import gql from 'graphql-tag';
import { Pizza, QueryPizzas, Ingredient, QueryIngredientes } from '../types';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})

export class ListComponent implements OnInit {
  closeResult: string;
  pizzas: Observable<Pizza[]>;
  ingredientes: Observable<Ingredient[]>;
  namePizza: any;
  originPizza: any;
  idIngredient: any;
  editar = false;
  pizza: any;
  public model: any;
  idIngrediente: any;
  ingredientesSelect: any;

  nameIngrediente: any;
  caloriasIngrediente: any;
  idIngredienteEdit: any;

  editarIngrediente = false;
  constructor(private apollo: Apollo, private modalService: NgbModal) { }
  ngOnInit() {
    this.pizzas = this.apollo.watchQuery<QueryPizzas>({
      query: gql`
        query pizzas {
          pizzas {
            id
            name
            origin
            ingredients{
              id
              name
            }
          }
        }
      `
    })
      .valueChanges
      .pipe(
        map(result => result.data.pizzas)
      );

  }

  public eliminarPizza(idPizza, namePizza) {
    if (confirm('Se eliminará ' + namePizza)) {
      const deletePizza = gql`
  mutation deletePizza($id: Int!) {
    deletePizza(id: $id) {
      id
    }
  }
`;
      this.apollo.mutate({
        mutation: deletePizza,
        variables: {
          id: idPizza
        }
      }).subscribe(({ data }) => {
        console.log('got data', data);
        this.getPizzas();
      }, (error) => {
        console.log('there was an error sending the query', error);
      });
    }
  }
  private getPizzas() {
    this.pizzas = this.apollo.watchQuery<QueryPizzas>({
      query: gql`
        query pizzas {
          pizzas {
            id
            name
            origin
            ingredients{
              id
              name
            }
          }
        }
      `
    })
      .valueChanges
      .pipe(
        map(result => result.data.pizzas)
      );
    this.editar = false;
  }
  getIngredientes() {
    this.ingredientes = this.apollo.watchQuery<QueryIngredientes>({
      query: gql`
      query ingredientes {
        ingredientes {
          id
          name
          calories
        }
      }
    `
    })
      .valueChanges
      .pipe(
        map(result => result.data.ingredientes)
      );
  }
  open(content) {
    this.getIngredientes();
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;

      this.namePizza = "";
      this.originPizza = "";
      this.idIngredient = "";
    }, (reason) => {
      this.namePizza = "";
      this.originPizza = "";
      this.idIngredient = "";
    });
  }




  crearPizza() {
    const createPizza = gql`
    mutation createPizza($name: String!, $origin:String, $ingredientIds:[Int]) {
      createPizza(pizza:{name: $name, origin: $origin, ingredientIds: $ingredientIds}) {
        id
      }
    }
  `;
    const idIn = (this.idIngredient.split(','));
    for (let index = 0; index < idIn.length; index++) {
      idIn[index] = Number(idIn[index]);
    }
    console.log(idIn);
    this.apollo.mutate({
      mutation: createPizza,
      variables: {
        name: this.namePizza,
        origin: this.originPizza,
        ingredientIds: idIn
      }
    }).subscribe(({ data }) => {
      console.log('got data', data);
      this.getPizzas();
      this.namePizza = "";
      this.originPizza = "";
      this.idIngredient = "";
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }
  actualizarPizza(idPizza) {
    const updatePizza = gql`
    mutation updatePizza($id: Int!,$name: String!, $origin:String, $ingredientIds:[Int]) {
      updatePizza(pizza:{id: $id,name: $name, origin: $origin, ingredientIds: $ingredientIds}) {
        id
      }
    }
  `;
    const idIn = (this.idIngredient.split(','));
    for (let index = 0; index < idIn.length; index++) {
      idIn[index] = Number(idIn[index]);
    }
    this.apollo.mutate({
      mutation: updatePizza,
      variables: {
        id: idPizza,
        name: this.namePizza,
        origin: this.originPizza,
        ingredientIds: idIn
      }
    }).subscribe(({ data }) => {
      console.log('got data', data);
      this.getPizzas();
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }
  guardar() {
    if (!this.editar) {
      this.crearPizza();
    } else {
      this.actualizarPizza(this.pizza.id);
    }

  }
  editarPizza(pizza, content) {
    console.log(pizza);
    this.pizza = pizza;
    this.namePizza = pizza.name;
    this.originPizza = pizza.origin;
    this.idIngredient = undefined;
    pizza.ingredients.forEach(i => {
      if (this.idIngredient !== undefined) {
        this.idIngredient += "," + i.id;
      } else {
        this.idIngredient = i.id;
      }
    });
    this.open(content);
    this.editar = true;
    this.getIngredientes();
  }

  seleccionarIngrediente() {
    console.log(this.idIngrediente)
    if (this.idIngredient !== undefined) {
      this.idIngredient += "," + this.idIngrediente;
    } else {
      this.idIngredient = this.idIngrediente;
    }
  }


  /**********************+
   * INGREDIENTES
   * 
   *****************************/
  /**
   * Abrir modal de ingredientes
   */
  openIngrediente(modalIngrediente) {
    this.getIngredientes();
    this.modalService.open(modalIngrediente, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`
    }, (reason) => {

    });
  }
  /**
   * Guardar ingrediente
   */
  guardarIngriente() {
    const createIngrediente = gql`
    mutation createIngrediente($name: String!, $calories:String) {
      createIngrediente(ingrediente:{name: $name, calories: $calories}) {
        id
      }
    }
  `;

    this.apollo.mutate({
      mutation: createIngrediente,
      variables: {
        name: this.nameIngrediente,
        calories: this.caloriasIngrediente
      }
    }).subscribe(({ data }) => {
      console.log('got data', data);
      this.getIngredientes();
      this.nameIngrediente = "";
      this.caloriasIngrediente = "";
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }



  /**
   * Eliminar ingrediente
   * @param idIngrediente 
   * @param nombre 
   */
  eliminarIngrediente(idIngrediente, nombre) {
    if (confirm('Se eliminará ' + nombre)) {
      const deleteIngrediente = gql`
  mutation deleteIngrediente($id: Int!) {
    deleteIngrediente(id: $id) {
      id
    }
  }
`;
      this.apollo.mutate({
        mutation: deleteIngrediente,
        variables: {
          id: idIngrediente
        }
      }).subscribe(({ data }) => {
        console.log('got data', data);
        this.getIngredientes();
        this.getPizzas();
      }, (error) => {
        console.log('there was an error sending the query', error);
      });
    }
  }
  /**
   * Editar ingrediente: llena los campos
   */


  ingredienteEditar(ingre) {
    this.editarIngrediente = true;
    this.nameIngrediente = ingre.name;
    this.caloriasIngrediente = ingre.calories;
    this.idIngredienteEdit = ingre.id;
  }

  actualizarIngrediente() {
    const updateIngrediente = gql`
    mutation actualizarIngrediente($id: Int!,$name: String!, $calories:String) {
      updateIngrediente(ingrediente:{id: $id,name: $name, calories: $calories}) {
        id
      }
    }
  `;

    this.apollo.mutate({
      mutation: updateIngrediente,
      variables: {
        id: this.idIngredienteEdit,
        name: this.nameIngrediente,
        calories: this.caloriasIngrediente
      }
    }).subscribe(({ data }) => {
      console.log('got data', data);
      this.getIngredientes();
      this.idIngredienteEdit = "";
      this.nameIngrediente = "";
      this.caloriasIngrediente = "";
      this.editarIngrediente = false;
    }, (error) => {
      console.log('there was an error sending the query', error);
    });

  }
}


