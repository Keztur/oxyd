let balls = []

export function run_sim(x_mouse_vec, y_mouse_vec, width, height, ctx, mode) {

    let ball_count = balls.length

    ball_move(x_mouse_vec, y_mouse_vec, ball_count)
    ball_ball_collision(mode, ball_count)
    ball_wall_collision(ctx, width, height, ball_count)
    
}

export function add_ball() {

    let radius = Math.floor(Math.random() * 45) + 5;
    let color = random_color();
    let ball_count = balls.length;
    let values = [];

    switch (ball_count) {
        case 0: values = [700.0, 200.0, 0.0, 0.0, 50.0]
        break
        case 1: values = [100.0, 200.0, 7.0,  0.0, 15.0]
        break
        case 2: values = [700.0, 300.0, -7.0, 0.0, 50.0]
        break
        case 3: values = [100.0, 300.0, 5.0, 1.0, 15.0]
        break
        default:  values = [50.0, 50.0, Math.floor(Math.random() * 15), Math.floor(Math.random() * 15), radius]
    }

    let ball = {x: values[0], y: values[1], x_vec: values[2], y_vec: values[3], radius: values[4], color};
    balls.push(ball);
}


function ball_move(x_mouse_vec, y_mouse_vec, ball_count) {

    const friction = 0.994;  
    const force = 0.1;

    //move ball loop
    for (let i = 0; i < ball_count; i++) {
        
        let x_vec = (balls[i].x_vec * friction) + (x_mouse_vec * force);
        let y_vec = (balls[i].y_vec * friction) + (y_mouse_vec * force);
        
        balls[i].x_vec = x_vec;
        balls[i].y_vec = y_vec;

        balls[i].x += x_vec;
        balls[i].y += y_vec;
        
    }
}

function ball_wall_collision(ctx, width, height, ball_count) {
    
    //ball-wall collision check
    for (let i = 0; i < ball_count; i++) {

        let reflected = [0,0]

        reflected = reflect(balls[i].x, balls[i].x_vec, balls[i].radius, width - balls[i].radius);
        balls[i].x = reflected[0]
        balls[i].x_vec = reflected[1] 

        reflected = reflect(balls[i].y, balls[i].y_vec, balls[i].radius, height - balls[i].radius);
        balls[i].y = reflected[0] 
        balls[i].y_vec = reflected[1]  

        draw_ball(ctx, balls[i].x, balls[i].y, balls[i].radius, balls[i].color);
        
    }
}

function ball_ball_collision(mode, ball_count) {
    //ball-ball collision check

    //loop through all balls
    for (let i = 0; i < ball_count; i++) {
        
        //loop through "all" balls again (skipping all duplicate combinations)
        for (let j = i+1; j < ball_count; j++) {
            
            //check for balls intersection
            if ((balls[i].x - balls[j].x) ** 2 + (balls[i].y - balls[j].y) ** 2 < (balls[i].radius + balls[j].radius) ** 2 )

            {
                //reset balls to position before collision
                balls[i].x = balls[i].x - balls[i].x_vec;
                balls[i].y = balls[i].y - balls[i].y_vec;
                balls[j].x = balls[j].x - balls[j].x_vec;
                balls[j].y = balls[j].y - balls[j].y_vec;
                
                //calculate collision vector
                let colvec_x = balls[i].x - balls[j].x;
                let colvec_y = balls[i].y - balls[j].y;
                
                // //get amount of collision vector
                let colvec_amount = Math.hypot(colvec_x, colvec_y);

                //normalize collision vector
                colvec_x = colvec_x / colvec_amount;
                colvec_y = colvec_y / colvec_amount;
                
                if (mode == 1) {  //BUBBLES

                    //get amount auf (velocity) vector for each ball
                    let ball_i_amount = Math.hypot(balls[i].x_vec, balls[i].y_vec);
                    let ball_j_amount = Math.hypot(balls[j].x_vec, balls[j].y_vec);
                
                    balls[i].x_vec += (colvec_x * ball_i_amount) * 0.4 + (colvec_x * ball_j_amount) * 0.4;
                    balls[i].y_vec += (colvec_y * ball_i_amount) * 0.4 + (colvec_y * ball_j_amount) * 0.4;
                    balls[j].x_vec -= (colvec_x * ball_j_amount) * 0.4 + (colvec_x * ball_i_amount) * 0.4;
                    balls[j].y_vec -= (colvec_y * ball_j_amount) * 0.4 + (colvec_y * ball_i_amount) * 0.4;

                } else {        //RIGID
                    //mass calculation (not working)
                    // let mi = (balls[i].radius / 2.0).powi(2) * PI;
                    // let mj = (balls[j].radius / 2.0).powi(2) * PI;
                    // let m = mi + mj;   

                    //moves balls away from each other (intersection prevention)
                    let intersection = balls[i].radius + balls[j].radius - colvec_amount;
                    let offset_factor = intersection / 2.0;
                    
                    balls[i].x += colvec_x * offset_factor;
                    balls[i].y += colvec_y * offset_factor;
                    balls[j].x -= colvec_x * offset_factor;
                    balls[j].y -= colvec_y * offset_factor;

                    
                     // https://flatredball.com/documentation/tutorials/math/circle-collision/ ####################

                    //get tangent vector
                    let tan_x = balls[j].y - balls[i].y;
                    let tan_y = -(balls[j].x - balls[i].x);

                    let tan_amount = Math.hypot(tan_x, tan_y); //needed for normalization

                    //normalize collision tangent
                    tan_x = tan_x / tan_amount;
                    tan_y = tan_y / tan_amount;

                    //get relative speed of balls to each other
                    let relx = balls[j].x_vec -  balls[i].x_vec;
                    let rely = balls[j].y_vec -  balls[i].y_vec;
                    
                    //velocity vector component parallel to tangent
                    let length = relx * tan_x + tan_y * rely; //dot product of relative vel vector and tangent vector

                    //calculate tangential vector component
                    let tangent_x = tan_x * length;
                    let tangent_y = tan_y * length;

                    //calculate perpendicular vector component (bounce vector)
                    let perpen_x =  relx - tangent_x;
                    let perpen_y =  rely - tangent_y;
                

                    balls[i].x_vec += perpen_x;
                    balls[i].y_vec += perpen_y;
                    balls[j].x_vec -= perpen_x;
                    balls[j].y_vec -= perpen_y;

                }

                //set new ball positions (with new vector)
                balls[i].x += balls[i].x_vec;
                balls[i].y += balls[i].y_vec;
                balls[j].x += balls[j].x_vec;
                balls[j].y += balls[j].y_vec;

            }
        }
    }

}

function reflect(pos, vec, radius, border) {

    if (pos < radius) {           //collision with low border (left or up)
        pos = radius - (pos - radius);
        vec = -vec;
    } else if  (pos > border) {   //collision with high border (right or bottom)
        pos = border - (pos - border);
        vec = -vec;
    } else {                    //no collision
        pos = pos;
    }

    return [pos, vec]
}
    

function random_color() {
  
    const randomBetween = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
    const r = randomBetween(0, 200);
    const g = randomBetween(0, 200);
    const b = randomBetween(0, 200);
    return `rgb(${r},${g},${b})`; // Collect all to a css color string

}

function draw_ball(ctx, x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0.0, 6.2831);
    ctx.fillStyle = color;   
    ctx.fill();
    ctx.closePath();
}


    